"""Python implementation of the W3C Provenance Data Model (PROV-DM), including support for PROV-JSON import/export

References:

PROV-DM: http://www.w3.org/TR/prov-dm/
PROV-JSON: https://provenance.ecs.soton.ac.uk/prov-json/

@author: Trung Dong Huynh <trungdong@donggiang.com>
@copyright: University of Southampton 2014
"""

import logging
import itertools

logger = logging.getLogger(__name__)

import datetime
import dateutil.parser
from collections import defaultdict
from copy import deepcopy
from prov import Error, serializers

try:
    from cStringIO import StringIO
    assert StringIO
except ImportError:
    from StringIO import StringIO
    assert StringIO


import os
import shutil
import tempfile
from urlparse import urlparse

from prov.identifier import Identifier, QualifiedName, XSDQName
from prov.constants import *


# Data Types
def _ensure_datetime(value):
    if isinstance(value, basestring):
        return dateutil.parser.parse(value)
    else:
        return value


def parse_xsd_datetime(value):
    try:
        return dateutil.parser.parse(value)
    except ValueError:
        pass
    return None

DATATYPE_PARSERS = {
    datetime.datetime: parse_xsd_datetime,
}


def _parse_datatype(value, datatype):
    if datatype in DATATYPE_PARSERS:
        #  found the required parser
        return DATATYPE_PARSERS[datatype](value)
    else:
        #  No parser found for the given data type
        raise Exception(u'No parser found for the data type <%s>' % unicode(datatype))


# Mappings for XSD datatypes to Python standard types
XSD_DATATYPE_PARSERS = {
    u"xsd:string": unicode,
    u"xsd:double": float,
    u"xsd:long": long,
    u"xsd:int": int,
    u"xsd:boolean": bool,
    u"xsd:dateTime": parse_xsd_datetime,
}


def parse_xsd_types(value, datatype):
    # if the datatype is a QName, convert it to a Unicode string
    datatype = unicode(datatype)
    return XSD_DATATYPE_PARSERS[datatype](value) if datatype in XSD_DATATYPE_PARSERS else None


first = lambda a_set: next(iter(a_set), None)


def _ensure_multiline_string_triple_quoted(s):
    format_str = u'"""%s"""' if isinstance(s, basestring) and '\n' in s else u'"%s"'
    return format_str % s


def encoding_provn_value(value):
    if isinstance(value, basestring):
        return _ensure_multiline_string_triple_quoted(value)
    elif isinstance(value, datetime.datetime):
        return value.isoformat()
    elif isinstance(value, float):
        return u'"%g" %%%% xsd:float' % value
    elif isinstance(value, bool):
        return u'"%i" %%%% xsd:boolean' % value        
    else:
        # TODO: QName export
        return unicode(value)


class Literal(object):
    def __init__(self, value, datatype=None, langtag=None):
        self._value = value
        if langtag:
            if datatype is None:
                logger.debug('Assuming prov:InternationalizedString as the type of "%s"@%s' % (value, langtag))
                datatype = PROV["InternationalizedString"]
            elif datatype != PROV["InternationalizedString"]:
                logger.warn(
                    'Invalid data type (%s) for "%s"@%s, overridden as prov:InternationalizedString.' %
                    (datatype, value, langtag)
                )
                datatype = PROV["InternationalizedString"]
        self._datatype = datatype
        self._langtag = langtag

    def __unicode__(self):
        return self.provn_representation()

    def __str__(self):
        return unicode(self).encode('utf-8')

    def __repr__(self):
        return u'<Literal: %s>' % self.provn_representation()

    def __eq__(self, other):
        return (self._value == other.value and self._datatype == other.datatype and self._langtag == other.langtag)\
            if isinstance(other, Literal) else False

    def __hash__(self):
        return hash((self._value, self._datatype, self._langtag))

    @property
    def value(self):
        return self._value

    @property
    def datatype(self):
        return self._datatype

    @property
    def langtag(self):
        return self._langtag

    def has_no_langtag(self):
        return self._langtag is None

    def provn_representation(self):
        if self._langtag:
            #  a language tag can only go with prov:InternationalizedString
            return u'%s@%s' % (_ensure_multiline_string_triple_quoted(self._value), unicode(self._langtag))
        else:
            return u'%s %%%% %s' % (_ensure_multiline_string_triple_quoted(self._value), unicode(self._datatype))


# Exceptions and warnings
class ProvException(Error):
    """Base class for PROV model exceptions."""
    pass


class ProvWarning(Warning):
    """Base class for PROV model warnings."""
    pass


class ProvExceptionInvalidQualifiedName(ProvException):
    def __init__(self, qname):
        self.qname = qname

    def __unicode__(self):
        return u'Invalid Qualified Name: %s' % self.qname


class ProvExceptionNotValidAttribute(ProvException):
    def __init__(self, record_type, attribute, attribute_types):
        self.record_type = record_type
        self.attribute = attribute
        self.attribute_types = attribute_types
        self.args += (PROV_N_MAP[record_type], unicode(attribute), attribute_types)

    def __str__(self):
        return 'Invalid attribute value: %s. %s expected' % (self.attribute, self.attribute_types)


class ProvExceptionCannotUnifyAttribute(ProvException):
    def __init__(self, identifier, record_type1, record_type2):
        self.identifier = identifier
        self.record_type1 = record_type1
        self.record_type2 = record_type2
        self.args += (identifier, PROV_N_MAP[record_type1], PROV_N_MAP[record_type2])

    def __str__(self):
        return 'Cannot unify two records of type %s and %s with same identifier (%s)' % (self.identifier, PROV_N_MAP[self.record_type1], PROV_N_MAP[self.record_type2])


class ProvExceptionContraint(ProvException):
    def __init__(self, record_type, attribute1, attribute2, msg):
        self.record_type = record_type
        self.attribute1 = attribute1
        self.attribute2 = attribute2
        self.args += (PROV_N_MAP[record_type], attribute1, attribute2, msg)
        self.msg = msg


#  PROV records
class ProvRecord(object):
    """Base class for PROV records."""
    FORMAL_ATTRIBUTES = ()

    def __init__(self, bundle, identifier, attributes=None):
        self._bundle = bundle
        self._identifier = identifier
        self._attributes = defaultdict(set)
        if attributes:
            self.add_attributes(attributes)

    def copy(self):
        """
        Return an exact copy of this record.
        """
        return PROV_REC_CLS[self.get_type()](self._bundle, self.identifier, self.attributes)

    def get_type(self):
        """Returning the PROV type of the record"""
        pass

    def get_asserted_types(self):
        return self._attributes[PROV_TYPE]

    def add_asserted_type(self, type_identifier):
        self._attributes[PROV_TYPE].add(type_identifier)

    def get_attribute(self, attr_name):
        attr_name = self._bundle.valid_qualified_name(attr_name)
        return self._attributes[attr_name]

    @property
    def identifier(self):
        return self._identifier

    @property
    def attributes(self):
        return [(attr_name, value) for attr_name, values in self._attributes.items() for value in values]

    @property
    def args(self):
        return tuple(first(self._attributes[attr_name]) for attr_name in self.FORMAL_ATTRIBUTES)

    @property
    def formal_attributes(self):
        return tuple((attr_name, first(self._attributes[attr_name])) for attr_name in self.FORMAL_ATTRIBUTES)

    @property
    def bundle(self):
        return self._bundle

    @property
    def label(self):
        return first(self._attributes[PROV_LABEL]) if self._attributes[PROV_LABEL] else self._identifier

    @property
    def value(self):
        return self._attributes[PROV_VALUE]

    def _auto_literal_conversion(self, literal):
        # This method normalise datatype for literals
        if isinstance(literal, str):
            return unicode(literal)

        if isinstance(literal, Literal) and literal.has_no_langtag():
            # try convert generic Literal object to Python standard type if possible
            # this is to match JSON decoding's literal conversion
            value = parse_xsd_types(literal.value, literal.datatype)
            if value is not None:
                return value

        # No conversion here, return the original value
        return literal

    def add_attributes(self, attributes):
        if attributes:
            if isinstance(attributes, dict):
                #  Converting the dictionary into a list of tuples (i.e. attribute-value pairs)
                attributes = attributes.items()
            for attr_name, original_value in attributes:
                if original_value is None:
                    continue
                attr = self._bundle.valid_qualified_name(attr_name)  # make sure the attribute name is valid
                if attr is None:
                    raise ProvExceptionInvalidQualifiedName(attr_name)

                if attr in PROV_ATTRIBUTE_QNAMES:
                    # Expecting a qualified name
                    qname = original_value.identifier if isinstance(original_value, ProvRecord) else original_value
                    value = self._bundle.valid_qualified_name(qname)
                elif attr in PROV_ATTRIBUTE_LITERALS:
                    value = original_value if isinstance(original_value, datetime.datetime) else \
                        parse_xsd_datetime(original_value)
                else:
                    value = self._auto_literal_conversion(original_value)

                if value is None:
                    raise ProvException(u'Invalid value for attribute %s: %s' % (attr, original_value))

                if attr in PROV_ATTRIBUTES and self._attributes[attr]:
                    existing_value = first(self._attributes[attr])
                    if value != existing_value:
                        raise ProvException(u'Cannot have more than one value for attribute %s' % attr)
                    else:
                        # Same value, ignore it
                        continue

                self._attributes[attr].add(value)

    def __eq__(self, other):
        if self.get_type() != other.get_type():
            return False
        if self._identifier and not (self._identifier == other._identifier):
            return False

        return self._attributes == other._attributes

    def __unicode__(self):
        return self.get_provn()

    def __str__(self):
        return unicode(self).encode('utf-8')

    def get_provn(self):
        items = []

        # Generating identifier
        relation_id = u''  # default blank
        if self._identifier:
            identifier = unicode(self._identifier)  # TODO: QName export
            if self.is_element():
                items.append(identifier)
            else:
                # this is a relation
                relation_id = identifier + '; '  # relations use ; to separate identifiers

        # Writing out the formal attributes
        for attr in self.FORMAL_ATTRIBUTES:
            values = self._attributes[attr]
            if values:
                value = first(values)  # Formal attributes always have single values
                # TODO: QName export
                items.append(value.isoformat() if isinstance(value, datetime.datetime) else unicode(value))
            else:
                items.append(u'-')

        # Writing out the remaining attributes
        extra = []
        for attr in self._attributes:
            if attr not in self.FORMAL_ATTRIBUTES:
                for value in self._attributes[attr]:
                    try:
                        # try if there is a prov-n representation defined
                        provn_represenation = value.provn_representation()
                    except AttributeError:
                        provn_represenation = encoding_provn_value(value)
                    # TODO: QName export
                    extra.append(u'%s=%s' % (unicode(attr), provn_represenation))

        if extra:
            items.append(u'[%s]' % u', '.join(extra))
        prov_n = u'%s(%s%s)' % (PROV_N_MAP[self.get_type()], relation_id, u', '.join(items))
        return prov_n

    def is_element(self):
        return False

    def is_relation(self):
        return False


# Abstract classes for elements and relations
class ProvElement(ProvRecord):
    def is_element(self):
        return True

    def __repr__(self):
        return u'<%s: %s>' % (self.__class__.__name__, self._identifier)


class ProvRelation(ProvRecord):
    def is_relation(self):
        return True

    def __repr__(self):
        identifier = u' %s' % self._identifier if self._identifier else u''
        element_1, element_2 = [qname for _, qname in self.formal_attributes[:2]]
        return u'<%s:%s (%s, %s)>' % (self.__class__.__name__, identifier, element_1, element_2)


#  ## Component 1: Entities and Activities
class ProvEntity(ProvElement):
    def get_type(self):
        return PROV_ENTITY


class ProvActivity(ProvElement):
    FORMAL_ATTRIBUTES = (PROV_ATTR_STARTTIME, PROV_ATTR_ENDTIME)

    def get_type(self):
        return PROV_ACTIVITY

    #  Convenient methods
    def set_time(self, startTime=None, endTime=None):
        if startTime is not None:
            self._attributes[PROV_ATTR_STARTTIME] = set([startTime])
        if endTime is not None:
            self._attributes[PROV_ATTR_ENDTIME] = set([endTime])

    def get_startTime(self):
        values = self._attributes[PROV_ATTR_STARTTIME]
        return first(values) if values else None

    def get_endTime(self):
        values = self._attributes[PROV_ATTR_ENDTIME]
        return first(values) if values else None


class ProvGeneration(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_ENTITY, PROV_ATTR_ACTIVITY, PROV_ATTR_TIME)

    def get_type(self):
        return PROV_GENERATION


class ProvUsage(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_ACTIVITY, PROV_ATTR_ENTITY, PROV_ATTR_TIME)

    def get_type(self):
        return PROV_USAGE


class ProvCommunication(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_INFORMED, PROV_ATTR_INFORMANT)

    def get_type(self):
        return PROV_COMMUNICATION


class ProvStart(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_ACTIVITY, PROV_ATTR_TRIGGER, PROV_ATTR_STARTER, PROV_ATTR_TIME)

    def get_type(self):
        return PROV_START


class ProvEnd(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_ACTIVITY, PROV_ATTR_TRIGGER, PROV_ATTR_ENDER, PROV_ATTR_TIME)

    def get_type(self):
        return PROV_END


class ProvInvalidation(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_ENTITY, PROV_ATTR_ACTIVITY, PROV_ATTR_TIME)

    def get_type(self):
        return PROV_INVALIDATION


### Component 2: Derivations
class ProvDerivation(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_GENERATED_ENTITY, PROV_ATTR_USED_ENTITY,
                         PROV_ATTR_ACTIVITY, PROV_ATTR_GENERATION, PROV_ATTR_USAGE)

    def get_type(self):
        return PROV_DERIVATION


### Component 3: Agents, Responsibility, and Influence
class ProvAgent(ProvElement):
    def get_type(self):
        return PROV_AGENT


class ProvAttribution(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_ENTITY, PROV_ATTR_AGENT)

    def get_type(self):
        return PROV_ATTRIBUTION


class ProvAssociation(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_ACTIVITY, PROV_ATTR_AGENT, PROV_ATTR_PLAN)

    def get_type(self):
        return PROV_ASSOCIATION


class ProvDelegation(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_DELEGATE, PROV_ATTR_RESPONSIBLE, PROV_ATTR_ACTIVITY)

    def get_type(self):
        return PROV_DELEGATION


class ProvInfluence(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_INFLUENCEE, PROV_ATTR_INFLUENCER)

    def get_type(self):
        return PROV_INFLUENCE


### Component 5: Alternate Entities
class ProvSpecialization(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_SPECIFIC_ENTITY, PROV_ATTR_GENERAL_ENTITY)

    def get_type(self):
        return PROV_SPECIALIZATION


class ProvAlternate(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_ALTERNATE1, PROV_ATTR_ALTERNATE2)

    def get_type(self):
        return PROV_ALTERNATE


class ProvMention(ProvSpecialization):
    FORMAL_ATTRIBUTES = (PROV_ATTR_SPECIFIC_ENTITY, PROV_ATTR_GENERAL_ENTITY, PROV_ATTR_BUNDLE)

    def get_type(self):
        return PROV_MENTION


### Component 6: Collections
class ProvMembership(ProvRelation):
    FORMAL_ATTRIBUTES = (PROV_ATTR_COLLECTION, PROV_ATTR_ENTITY)

    def get_type(self):
        return PROV_MEMBERSHIP


#  Class mappings from PROV record type
PROV_REC_CLS = {
    PROV_ENTITY:         ProvEntity,
    PROV_ACTIVITY:       ProvActivity,
    PROV_GENERATION:     ProvGeneration,
    PROV_USAGE:          ProvUsage,
    PROV_COMMUNICATION:  ProvCommunication,
    PROV_START:          ProvStart,
    PROV_END:            ProvEnd,
    PROV_INVALIDATION:   ProvInvalidation,
    PROV_DERIVATION:     ProvDerivation,
    PROV_AGENT:          ProvAgent,
    PROV_ATTRIBUTION:    ProvAttribution,
    PROV_ASSOCIATION:    ProvAssociation,
    PROV_DELEGATION:     ProvDelegation,
    PROV_INFLUENCE:      ProvInfluence,
    PROV_SPECIALIZATION: ProvSpecialization,
    PROV_ALTERNATE:      ProvAlternate,
    PROV_MENTION:        ProvMention,
    PROV_MEMBERSHIP:     ProvMembership,
}


DEFAULT_NAMESPACES = {'prov': PROV, 'xsd': XSD}


#  Bundle
class NamespaceManager(dict):
    def __init__(self, namespaces=None, default=None, parent=None):
        dict.__init__(self)
        self._default_namespaces = DEFAULT_NAMESPACES
        self.update(self._default_namespaces)
        self._namespaces = {}

        if default is not None:
            self.set_default_namespace(default)
        else:
            self._default = None
        self.parent = parent
        #  TODO check if default is in the default namespaces
        self._anon_id_count = 0
        self._uri_map = dict()
        self._rename_map = dict()
        self._prefix_renamed_map = dict()
        self.add_namespaces(namespaces)

    def get_namespace(self, uri):
        for namespace in self.values():
            if uri == namespace._uri:
                return namespace
        return None

    def get_registered_namespaces(self):
        return self._namespaces.values()

    def set_default_namespace(self, uri):
        self._default = Namespace('', uri)
        self[''] = self._default

    def get_default_namespace(self):
        return self._default

    def add_namespace(self, namespace):
        if namespace in self.values():
            #  no need to do anything
            return namespace
        if namespace in self._rename_map:
            #  already renamed and added
            return self._rename_map[namespace]

        # Checking if the URI has been defined and use the existing namespace instead
        uri = namespace.uri
        prefix = namespace.prefix

        if uri in self._uri_map:
            existing_ns = self._uri_map[uri]
            self._rename_map[namespace] = existing_ns
            self._prefix_renamed_map[prefix] = existing_ns
            return existing_ns

        if prefix in self:
            #  Conflicting prefix
            new_prefix = self._get_unused_prefix(prefix)
            new_namespace = Namespace(new_prefix, namespace.uri)
            self._rename_map[namespace] = new_namespace
            # TODO: What if the prefix is already in the map and point to a different Namespace? Raise an exception?
            self._prefix_renamed_map[prefix] = new_namespace
            prefix = new_prefix
            namespace = new_namespace

        # Only now add the namespace to the registry
        self._namespaces[prefix] = namespace
        self[prefix] = namespace
        self._uri_map[uri] = namespace

        return namespace

    def add_namespaces(self, namespaces):
        if namespaces:
            for prefix, uri in namespaces.items():
                ns = Namespace(prefix, uri)
                self.add_namespace(ns)

    def valid_qualified_name(self, qname):
        if not qname:
            return None

        if isinstance(qname, QualifiedName):
            #  Register the namespace if it has not been registered before
            namespace = qname.namespace
            prefix = namespace.prefix
            if prefix in self and self[prefix] == namespace:
                # No need to add the namespace
                existing_ns = self[prefix]
                if existing_ns is namespace:
                    return qname
                else:
                    return existing_ns[qname.localpart]  # reuse the existing namespace
            else:
                ns = self.add_namespace(deepcopy(namespace))  # Do not reuse the namespace object
                return ns[qname.localpart]  # minting the same Qualified Name from the namespace's copy

        if not isinstance(qname, (basestring, Identifier)):
            # Only proceed for string or URI values
            return None
        # Try to generate a Qualified Name
        str_value = qname.uri if isinstance(qname, Identifier) else unicode(qname)
        if str_value.startswith('_:'):
            # this is a blank node ID
            return None
        elif ':' in str_value:
            #  check if the identifier contains a registered prefix
            prefix, local_part = str_value.split(':', 1)
            if prefix in self:
                #  return a new QualifiedName
                return self[prefix][local_part]
            if prefix in self._prefix_renamed_map:
                #  return a new QualifiedName
                return self._prefix_renamed_map[prefix][local_part]
            else:
                #  treat as a URI (with the first part as its scheme)
                #  check if the URI can be compacted
                for namespace in self.values():
                    if str_value.startswith(namespace.uri):
                        #  create a QName with the namespace
                        return namespace[str_value.replace(namespace.uri, '')]
                if self.parent is not None:
                    # try the parent namespace manager
                    return self.parent.valid_qualified_name(qname)
                else:
                    #  return None as we cannot generate a Qualified Name from the given URI
                    return None
        elif self._default:
            #  create and return an identifier in the default namespace
            return self._default[qname]

        # Default to FAIL
        return None

    def get_anonymous_identifier(self, local_prefix='id'):
        self._anon_id_count += 1
        return Identifier('_:%s%d' % (local_prefix, self._anon_id_count))

    def _get_unused_prefix(self, original_prefix):
        if original_prefix not in self:
            return original_prefix
        count = 1
        while True:
            new_prefix = '_'.join((original_prefix, unicode(count)))
            if new_prefix in self:
                count += 1
            else:
                return new_prefix


class ProvBundle(object):
    def __init__(self, records=None, identifier=None, namespaces=None, document=None):
        #  Initializing bundle-specific attributes
        self._identifier = identifier
        self._records = list()
        self._id_map = defaultdict(list)
        self._document = document
        self._namespaces = NamespaceManager(namespaces,
                                            parent=(document._namespaces if document is not None else None)
        )
        if records:
            for record in records:
                self._add_record(record)

    def __repr__(self):
        return u'<%s: %s>' % (self.__class__.__name__, self._identifier)

    @property
    def namespaces(self):
        return set(self._namespaces.get_registered_namespaces())

    @property
    def document(self):
        return self._document

    @property
    def identifier(self):
        return self._identifier

    #  Bundle configurations
    def set_default_namespace(self, uri):
        self._namespaces.set_default_namespace(uri)

    def get_default_namespace(self):
        return self._namespaces.get_default_namespace()

    def add_namespace(self, namespace_or_prefix, uri=None):
        if uri is None:
            return self._namespaces.add_namespace(namespace_or_prefix)
        else:
            return self._namespaces.add_namespace(Namespace(namespace_or_prefix, uri))

    def get_registered_namespaces(self):
        return self._namespaces.get_registered_namespaces()

    def valid_qualified_name(self, identifier):
        return self._namespaces.valid_qualified_name(identifier)

    def get_anon_id(self, record):
        #  TODO Implement a dict of self-generated anon ids for records without identifier
        return self._namespaces.get_anonymous_identifier()

    def get_records(self, class_or_type_or_tuple=None):
        results = list(self._records)
        if class_or_type_or_tuple:
            return filter(lambda rec: isinstance(rec, class_or_type_or_tuple), results)
        else:
            return results

    def get_record(self, identifier):
        # TODO: This will not work with the new _id_map, which is now a map of (QName, list(ProvRecord))
        if identifier is None:
            return None
        valid_id = self.valid_qualified_name(identifier)
        try:
            return self._id_map[valid_id]
        except KeyError:
            #  looking up the parent bundle
            if self.is_bundle():
                return self.document.get_record(valid_id)
            else:
                return None

    #  Miscellaneous functions
    def is_document(self):
        return False

    def is_bundle(self):
        return True

    def get_provn(self, _indent_level=0):
        indentation = '' + ('  ' * _indent_level)
        newline = '\n' + ('  ' * (_indent_level + 1))

        #  if this is the document, start the document; otherwise, start the bundle
        lines = ['document'] if self.is_document() else ['bundle %s' % self._identifier]

        default_namespace = self._namespaces.get_default_namespace()
        if default_namespace:
            lines.append('default <%s>' % default_namespace.uri)

        registered_namespaces = self._namespaces.get_registered_namespaces()
        if registered_namespaces:
            lines.extend(['prefix %s <%s>' % (namespace.prefix, namespace.uri) for namespace in registered_namespaces])

        if default_namespace or registered_namespaces:
            #  a blank line between the prefixes and the assertions
            lines.append('')

        #  adding all the records
        lines.extend([record.get_provn() for record in self._records])
        if self.is_document():
            # Print out bundles
            lines.extend(bundle.get_provn(_indent_level + 1) for bundle in self.bundles)
        provn_str = newline.join(lines) + '\n'

        #  closing the structure
        provn_str += indentation + ('endDocument' if self.is_document() else 'endBundle')
        return provn_str

    def __eq__(self, other):
        if not isinstance(other, ProvBundle):
            return False
        other_records = set(other.get_records())
        this_records = set(self.get_records())
        if len(this_records) != len(other_records):
            return False
        #  check if all records for equality
        for record_a in this_records:
            #  Manually look for the record
            found = False
            for record_b in other_records:
                if record_a == record_b:
                    other_records.remove(record_b)
                    found = True
                    break
            if not found:
                logger.debug("Equality (ProvBundle): Could not find this record: %s", unicode(record_a))
                return False
        return True

    # Transformations
    def _unified_records(self):
        """Returns a list of unified records
        """
        # TODO: Check unification rules in the PROV-CONSTRAINTS document
        # This method simply merges the records having the same name
        merged_records = dict()
        for identifier, records in self._id_map.items():
            if len(records) > 1:  # more than one record having the same identifier
                # merge the records
                merged = records[0].copy()
                for record in records[1:]:
                    merged.add_attributes(record.attributes)
                # map all of them to the merged record
                for record in records:
                    merged_records[record] = merged
        if not merged_records:
            # No merging done, just return the list of original records
            return list(self._records)

        added_merged_records = set()
        unified_records = list()
        for record in self._records:
            if record in merged_records:
                merged = merged_records[record]
                if merged not in added_merged_records:
                    unified_records.append(merged)
                    added_merged_records.add(merged)
            else:
                # add the original record
                unified_records.append(record)
        return unified_records

    def unified(self):
        """
        Returns a new ProvBundle in which all records having the same identifier are unified
        """
        unified_records = self._unified_records()
        bundle = ProvBundle(records=unified_records, identifier=self.identifier)
        return bundle

    #  Provenance statements
    def _add_record(self, record):
        # IMPORTANT: All records need to be added to a bundle/document via this method. Otherwise, the _id_map dict
        # will not be correctly updated
        identifier = record.identifier
        if identifier is not None:
            self._id_map[identifier].append(record)
        self._records.append(record)

    def add_record(self, record_type, identifier, attributes=None, other_attributes=None):
        attr_list = []
        if attributes:
            if isinstance(attributes, dict):
                attr_list.extend(
                    (attr, value) for attr, value in attributes.items()
                )
            else:
                # expecting a list of attributes here
                attr_list.extend(attributes)
        if other_attributes:
            attr_list.extend(
                other_attributes.items() if isinstance(other_attributes, dict) else other_attributes
            )
        new_record = PROV_REC_CLS[record_type](self, self.valid_qualified_name(identifier), attr_list)
        self._add_record(new_record)
        return new_record

    def entity(self, identifier, other_attributes=None):
        return self.add_record(PROV_ENTITY, identifier, None, other_attributes)

    def activity(self, identifier, startTime=None, endTime=None, other_attributes=None):
        return self.add_record(
            PROV_ACTIVITY, identifier, {
                PROV_ATTR_STARTTIME: _ensure_datetime(startTime),
                PROV_ATTR_ENDTIME: _ensure_datetime(endTime)
            },
            other_attributes
        )

    def generation(self, entity, activity=None, time=None, identifier=None, other_attributes=None):
        return self.add_record(
            PROV_GENERATION, identifier, {
                PROV_ATTR_ENTITY: entity,
                PROV_ATTR_ACTIVITY: activity,
                PROV_ATTR_TIME: _ensure_datetime(time)
            },
            other_attributes
        )

    def usage(self, activity, entity=None, time=None, identifier=None, other_attributes=None):
        return self.add_record(
            PROV_USAGE, identifier, {
                PROV_ATTR_ACTIVITY: activity,
                PROV_ATTR_ENTITY: entity,
                PROV_ATTR_TIME: _ensure_datetime(time)},
            other_attributes
        )

    def start(self, activity, trigger=None, starter=None, time=None, identifier=None, other_attributes=None):
        return self.add_record(
            PROV_START, identifier, {
                PROV_ATTR_ACTIVITY: activity,
                PROV_ATTR_TRIGGER: trigger,
                PROV_ATTR_STARTER: starter,
                PROV_ATTR_TIME: _ensure_datetime(time)
            },
            other_attributes
        )

    def end(self, activity, trigger=None, ender=None, time=None, identifier=None, other_attributes=None):
        return self.add_record(
            PROV_END, identifier, {
                PROV_ATTR_ACTIVITY: activity,
                PROV_ATTR_TRIGGER: trigger,
                PROV_ATTR_ENDER: ender,
                PROV_ATTR_TIME: _ensure_datetime(time)
            },
            other_attributes
        )

    def invalidation(self, entity, activity=None, time=None, identifier=None, other_attributes=None):
        return self.add_record(
            PROV_INVALIDATION, identifier, {
                PROV_ATTR_ENTITY: entity,
                PROV_ATTR_ACTIVITY: activity,
                PROV_ATTR_TIME: _ensure_datetime(time)
            },
            other_attributes
        )

    def communication(self, informed, informant, identifier=None, other_attributes=None):
        return self.add_record(
            PROV_COMMUNICATION, identifier, {
                PROV_ATTR_INFORMED: informed,
                PROV_ATTR_INFORMANT: informant
            },
            other_attributes
        )

    def agent(self, identifier, other_attributes=None):
        return self.add_record(PROV_AGENT, identifier, None, other_attributes)

    def attribution(self, entity, agent, identifier=None, other_attributes=None):
        return self.add_record(
            PROV_ATTRIBUTION, identifier, {
                PROV_ATTR_ENTITY: entity,
                PROV_ATTR_AGENT: agent
            },
            other_attributes
        )

    def association(self, activity, agent=None, plan=None, identifier=None, other_attributes=None):
        return self.add_record(
            PROV_ASSOCIATION, identifier, {
                PROV_ATTR_ACTIVITY: activity,
                PROV_ATTR_AGENT: agent,
                PROV_ATTR_PLAN: plan
            },
            other_attributes
        )

    def delegation(self, delegate, responsible, activity=None, identifier=None, other_attributes=None):
        return self.add_record(
            PROV_DELEGATION, identifier, {
                PROV_ATTR_DELEGATE: delegate,
                PROV_ATTR_RESPONSIBLE: responsible,
                PROV_ATTR_ACTIVITY: activity
            },
            other_attributes
        )

    def influence(self, influencee, influencer, identifier=None, other_attributes=None):
        return self.add_record(
            PROV_INFLUENCE, identifier, {
                PROV_ATTR_INFLUENCEE: influencee,
                PROV_ATTR_INFLUENCER: influencer
            },
            other_attributes
        )

    def derivation(self, generatedEntity, usedEntity, activity=None, generation=None, usage=None,
                   identifier=None, other_attributes=None):
        attributes = {PROV_ATTR_GENERATED_ENTITY: generatedEntity,
                      PROV_ATTR_USED_ENTITY: usedEntity,
                      PROV_ATTR_ACTIVITY: activity,
                      PROV_ATTR_GENERATION: generation,
                      PROV_ATTR_USAGE: usage}
        return self.add_record(PROV_DERIVATION, identifier, attributes, other_attributes)

    def revision(self, generatedEntity, usedEntity, activity=None, generation=None, usage=None,
                 identifier=None, other_attributes=None):
        record = self.derivation(generatedEntity, usedEntity, activity, generation, usage, identifier, other_attributes)
        record.add_asserted_type(PROV['Revision'])
        return record

    def quotation(self, generatedEntity, usedEntity, activity=None, generation=None, usage=None,
                  identifier=None, other_attributes=None):
        record = self.derivation(generatedEntity, usedEntity, activity, generation, usage, identifier, other_attributes)
        record.add_asserted_type(PROV['Quotation'])
        return record

    def primary_source(self, generatedEntity, usedEntity, activity=None, generation=None, usage=None,
                       identifier=None, other_attributes=None):
        record = self.derivation(generatedEntity, usedEntity, activity, generation, usage, identifier, other_attributes)
        record.add_asserted_type(PROV['PrimarySource'])
        return record

    def specialization(self, specificEntity, generalEntity):
        return self.add_record(
            PROV_SPECIALIZATION, None, {
                PROV_ATTR_SPECIFIC_ENTITY: specificEntity,
                PROV_ATTR_GENERAL_ENTITY: generalEntity
            }
        )

    def alternate(self, alternate1, alternate2):
        return self.add_record(
            PROV_ALTERNATE, None, {
                PROV_ATTR_ALTERNATE1: alternate1,
                PROV_ATTR_ALTERNATE2: alternate2
            },
        )

    def mention(self, specificEntity, generalEntity, bundle,):
        return self.add_record(
            PROV_MENTION, None, {
                PROV_ATTR_SPECIFIC_ENTITY: specificEntity,
                PROV_ATTR_GENERAL_ENTITY: generalEntity,
                PROV_ATTR_BUNDLE: bundle
            }
        )

    def collection(self, identifier, other_attributes=None):
        record = self.add_record(PROV_ENTITY, identifier, None, other_attributes)
        record.add_asserted_type(PROV['Collection'])
        return record

    def membership(self, collection, entity):
        return self.add_record(
            PROV_MEMBERSHIP, None, {
                PROV_ATTR_COLLECTION: collection,
                PROV_ATTR_ENTITY: entity
            }
        )

    #  Aliases
    wasGeneratedBy = generation
    used = usage
    wasStartedBy = start
    wasEndedBy = end
    wasInvalidatedBy = invalidation
    wasInformedBy = communication
    wasAttributedTo = attribution
    wasAssociatedWith = association
    actedOnBehalfOf = delegation
    wasInfluencedBy = influence
    wasDerivedFrom = derivation
    wasRevisionOf = revision
    wasQuotedFrom = quotation
    hadPrimarySource = primary_source
    alternateOf = alternate
    specializationOf = specialization
    mentionOf = mention
    hadMember = membership


class ProvDocument(ProvBundle):
    def __init__(self, records=None, namespaces=None):
        ProvBundle.__init__(self, records=records, identifier=None, namespaces=namespaces)
        self._bundles = dict()

    def __repr__(self):
        return u'<ProvDocument>'

    def is_document(self):
        return True

    def is_bundle(self):
        return False

    def has_bundles(self):
        return len(self._bundles) > 0

    @property
    def bundles(self):
        return set(self._bundles.values())

    # Transformations
    def flattened(self):
        """ Returns a new document containing all the records in its bundles
        """
        if self._bundles:
            # Creating a new document for all the records
            new_doc = ProvDocument()
            bundled_records = itertools.chain(
                *[b.get_records() for b in self._bundles.values()]
            )
            for record in itertools.chain(self._records, bundled_records):
                new_doc._add_record(record)
            return new_doc
        else:
            # returning the same document
            return self

    def unified(self):
        """
        Returns a new document containing all records having same identifiers unified (including those inside bundles)
        """
        document = ProvDocument(self._unified_records())
        for bundle in self.bundles:
            unified_bundle = bundle.unified()
            document.add_bundle(unified_bundle)
        return document

    # Bundle operations
    def add_bundle(self, bundle, identifier=None):
        """Add a bundle to the current document
        """
        if not isinstance(bundle, ProvBundle):
            raise ProvException(u'Only a ProvBundle instance can be added as a bundle in a ProvDocument.')

        if identifier is None:
            identifier = bundle.identifier

        if not identifier:
            raise ProvException(u'The provided bundle has no identifier')

        # Link the bundle namespace manager to the document's
        bundle._namespaces.parent = self._namespaces

        valid_id = bundle.valid_qualified_name(identifier)
        # IMPORTANT: Rewriting the bundle identifier for consistency
        bundle._identifier = valid_id

        if valid_id in self._bundles:
            raise ProvException(u"A bundle with that identifier already exists")

        self._bundles[valid_id] = bundle
        bundle._document = self

    def bundle(self, identifier):
        if identifier is None:
            raise ProvException('An identifier is required. Cannot create an unnamed bundle.')
        valid_id = self.valid_qualified_name(identifier)
        if valid_id in self._bundles:
            raise ProvException(u"A bundle with that identifier already exists")
        b = ProvBundle(identifier=valid_id, document=self)
        self._bundles[valid_id] = b
        return b

    # Serializing and deserializing
    def serialize(self, destination=None, format='json', **args):
        """Serialize the ProvDocument to destination

        If destination is None serialize method returns the serialization as a
        string. Format defaults to PROV-JSON.
        """
        serializer = serializers.get(format)(self)
        if destination is None:
            stream = StringIO()
            serializer.serialize(stream, **args)
            return stream.getvalue()
        if hasattr(destination, "write"):
            stream = destination
            serializer.serialize(stream, **args)
        else:
            location = destination
            scheme, netloc, path, params, _query, fragment = urlparse(location)
            if netloc != "":
                print("WARNING: not saving as location" +
                      "is not a local file reference")
                return
            fd, name = tempfile.mkstemp()
            stream = os.fdopen(fd, "wb")
            serializer.serialize(stream, **args)
            stream.close()
            if hasattr(shutil, "move"):
                shutil.move(name, path)
            else:
                shutil.copy(name, path)
                os.remove(name)

    @staticmethod
    def deserialize(source=None, content=None, format='json', **args):
        """Deserialize the ProvDocument from source (a stream or a filepath) or directly from a string content

        Format defaults to PROV-JSON.
        """
        serializer = serializers.get(format)()

        if content is not None:
            stream = StringIO(content)
            return serializer.deserialize(stream, **args)

        if source is not None:
            if hasattr(source, "read"):
                return serializer.deserialize(source, **args)
            else:
                with open(source) as f:
                    return serializer.deserialize(f, **args)