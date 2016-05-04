__author__ = 'tdh'

__all__ = [
    'get'
]

from prov import Error


class DoNotExist(Error):
    pass




class Registry:
    serializers = None

    @staticmethod
    def load_serializers():
        from prov.serializers.provjson import ProvJSONSerializer

        Registry.serializers = {
            'json': ProvJSONSerializer
        }


def get(format_name):
    """
    Returns the serializer class for the specified format. Raises a DoNotExist
    """
    # Lazily initialize the list of available serializers to avoid cyclic imports
    if Registry.serializers is None:
        Registry.load_serializers()
    try:
        return Registry.serializers[format_name]
    except KeyError:
        raise DoNotExist(
            'No serializer avaliable for the format "%s"' % format_name
        )


