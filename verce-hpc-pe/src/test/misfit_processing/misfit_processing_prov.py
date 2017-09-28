# data in the misfit_input.jsn file
# Type the following command, for running the workflow.
# python -m dispel4py.new.processor -t simple
# dispel4py/test/seismo/misfit_pes.py -f misfit_postprocess_input.jsn
import collections
import io
import os
from dispel4py.seismo.seismo import *
from dispel4py.core import GenericPE
from dispel4py.base import IterativePE
from dispel4py.workflow_graph import WorkflowGraph
import matplotlib.pyplot as plt
import obspy
from obspy.signal.tf_misfit import plotTfMisfits, em, pm
from PIL import Image
import pyflex
from pyflex import WindowSelector
#from dispel4py.visualisation import display



def weighting_function(win):
            return win.max_cc_value
        
        
class StreamProducer(GenericPE):
    """
    PE reading the JSON input file and generating one output per component of
    the input files. Will write to different output channels depending on the
    chosen misfit.
    """
    def __init__(self):
        GenericPE.__init__(self)
        self._add_input("input")
        self._add_output("output_pyflex")
        self._add_output("output_time_frequency")

    def _process(self, inputs):
        self.log("INPUT: "+str(inputs["input"]["data"]))
        data =inputs["input"]["data"]
        synth = inputs["input"]["synthetics"]
        stationxml = os.environ['STAGED_DATA']+'/'+inputs["input"]["stationxml"]
        quakeml = inputs["input"]["quakeml"]
       
        parameters = inputs["input"]["parameters"]
        event_id= inputs["input"]["event_id"]
        misfit_type = parameters["misfit_type"]
        output_folder = os.environ['STAGED_DATA']+'/'+inputs["input"]["output_folder"]+'/'+misfit_type+'/'
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        # Write to different output channels depending on the chosen type of
        # misfit.
        
        if misfit_type in ["pyflex", "pyflex_and_time_frequency"]:
            output_channel = "output_pyflex"
        elif misfit_type == "time_frequency":
            output_channel = "output_time_frequency"
        #else:
        #    raise NotImplementedError(
        #        "'misfit_type' must be one of 'pyflex', "
        #        "'pyflex_and_time_frequency', or 'time_frequency'")

        data_st = obspy.Stream()
        for d in data:
            data_st += obspy.read(os.environ['STAGED_DATA']+'/'+d)

        synth_st = obspy.Stream()
        for s in synth:
            synth_st += obspy.read(os.environ['STAGED_DATA']+'/'+s)

        # Get all available components.
        components = set([tr.stats.channel[-1] for tr in
                          (data_st + synth_st)])
        
        
        
        for comp in components:
            
            
            dic = self.extractItemMetadata(data_st.select(component=comp))
            raw_data={}
            
            if len(dic)>0:
                for key in dic[0]:
                   raw_data[key+'_raw']=dic[0][key]
                        
            else:
                self.error=self.error+' Problem extracting raw data for comp '+str(comp)+'and station: '+str(data_st)
                
                
            dic = self.extractItemMetadata(synth_st.select(component=comp))
            syn_data={}
            if len(dic)>0:
                for key in dic[0]:
                    syn_data[key+'_syn']=dic[0][key]
                
            else:
                self.error=self.error+' Problem extracting synth data for comp '+str(comp)+'and station: '+str(synth_st)
                
            provmet={ "misfit_type": misfit_type,'event_id':event_id}
            provmet.update(raw_data)
            provmet.update(syn_data)
            self.parameters=parameters
            self.log('COMP: '+comp)
            self.log('ST: '+str(synth_st))
            self.write(
                output_channel,
                {"data_trace": data_st.select(component=comp)[0],
                 "synthetic_trace": synth_st.select(component=comp)[0],
                 "stationxml": stationxml,
                 "quakeml": quakeml,
                 "output_folder": output_folder,
                 "misfit_type": misfit_type,
                 'event_id':event_id,
                 "parameters": parameters},metadata = provmet)


class PyflexPE(GenericPE):
    """
    PE calling pyflex. Will write images to the 'image' output channel, picked
    windows to the 'windows' output channel and depending on the misfit type it
    will also write to the 'window_tapering' output channel.
    """
    def __init__(self):
        GenericPE.__init__(self)
        self._add_input("input")
        self._add_output("image")
        self._add_output("windows")
        self._add_output("window_tapering")

    def _process(self, inputs):

        # Weighting function for the windows. This particular choice will tend
        # to favor lots of smaller windows if "interval_scheduling" is chosen
        # as overlap resolution strategy.
        

        ip = inputs["input"]
        param = ip["parameters"]
        

        config = pyflex.Config(
            min_period=param["min_period"],
            max_period=param["max_period"],
            stalta_waterlevel=param["stalta_waterlevel"],
            s2n_limit=param["s2n_limit"],
            snr_max_base=param["snr_max_base"],
            tshift_acceptance_level=param["tshift_acceptance_level"],
            tshift_reference=param["tshift_reference"],
            dlna_acceptance_level=param["dlna_acceptance_level"],
            dlna_reference=param["dlna_reference"],
            cc_acceptance_level=param["cc_acceptance_level"],
            earth_model=param["earth_model"],
            min_surface_wave_velocity=param["min_surface_wave_velocity"],
            max_time_before_first_arrival=param[
                "max_time_before_first_arrival"],
            c_0=param["c_0"],
            c_1=param["c_1"],
            c_2=param["c_2"],
            c_3a=param["c_3a"],
            c_3b=param["c_3b"],
            c_4a=param["c_4a"],
            c_4b=param["c_4b"],
            check_global_data_quality=param["check_global_data_quality"],
            snr_integrate_base=param["snr_integrate_base"],
            noise_start_index=param["noise_start_index"],
            noise_end_index=param["noise_end_index"],
            signal_start_index=param["signal_start_index"],
            signal_end_index=param["signal_end_index"],
            window_signal_to_noise_type=param["window_signal_to_noise_type"],
            resolution_strategy=param["resolution_strategy"],
            window_weight_fct=weighting_function)

        ws = WindowSelector(observed=ip["data_trace"],
                            synthetic=ip["synthetic_trace"],
                            config=config,
                            event=[_i for _i in obspy.readEvents(ip["quakeml"])
                                   if _i.resource_id.id == ip["event_id"]][0],
                            station=obspy.read_inventory(
                                ip["stationxml"], format="stationxml"))
        
        windows = ws.select_windows()

        data = ip["data_trace"]
        station_id = "%s.%s" % (data.stats.network,
                                data.stats.station)
        component = data.stats.channel[-1]

        # HACK!
        with io.BytesIO() as _:
            ws.plot(_)
        fig = plt.gcf()
        fig.suptitle("Component: %s" % component, fontsize=15,
                     horizontalalignment="center", x=0.8, y=1)
        with io.BytesIO() as buf:
            fig.savefig(buf)
            buf.seek(0, 0)
            # Not Python 3 compatible but who cares.
            image_string = buf.read()
        
        plt.close(fig)
        image_type = "pyflex_windows"

        # Metadata for Alessandro!
        metadata = [{"type": "pyflex",
                 "station_id": station_id,
                 "component": component,
                 "channel_id": win.channel_id,
                 "starttime": str(win.absolute_starttime),
                 "endtime": str(win.absolute_endtime),
                 "max_cc_value": win.max_cc_value,
                 "cc_shift": win.cc_shift,
                 "dlnA": win.dlnA} for win in windows]
        
        self.parameters=param
        self.write(
            "image",
            ({"image_string": image_string, "component": component,
              "output_folder": ip["output_folder"]},
             image_type, station_id),metadata=metadata)
        #control={'con:skip':True}

      #  self.write(
      #      "windows", {
      #          "record_type": "pyflex_windows",
      #          "output_folder": ip["output_folder"],
      #          "windows": windows,
      #          "station_id": station_id,
      #          "component": component},metadata=metadata)

        if ip["misfit_type"] == "pyflex_and_time_frequency":
            ip["windows"] = [{
                "starttime": win.absolute_starttime,
                "endtime": win.absolute_endtime} for win in windows]
            self.write("window_tapering", ip, metadata=metadata)


class WindowTaperingPE(GenericPE):
    def __init__(self):
        GenericPE.__init__(self)
        self._add_input("input")
        self._add_output("output")

    def _process(self, inputs):
        ip = inputs["input"]

        data = ip["data_trace"]
        synthetic = ip["synthetic_trace"]

        c_data = data.copy()
        c_synthetic = synthetic.copy()
        c_data.data[:] = 0.0
        c_synthetic.data[:] = 0.0

        # Taper around each window.
        for tr in (ip["data_trace"], ip["synthetic_trace"]):
            c_tr = tr.copy()
            c_tr.data[:] = 0.0
            for window in ip["windows"]:
                tr2 = tr.copy()
                tr2.trim(window["starttime"], window["endtime"])
                tr2.taper(max_percentage=0.05, type="hann")
                tr2.trim(c_tr.stats.starttime, c_tr.stats.endtime,
                         fill_value=0.0, pad=True)
                c_tr.data += tr2.data
            tr.data = c_tr.data

        self.write("output", ip)


class MatchComponents(GenericPE):
    def __init__(self):
        GenericPE.__init__(self)
        self._add_input('input', grouping=[1, 2])
        self._add_output('output')
        self.data = collections.defaultdict(dict)

    def _process(self, inputs):
        ip = inputs['input'][0]
        
        component = ip["component"]
        output_folder = ip["output_folder"]
        image_string = ip["image_string"]
        image_type = inputs["input"][1]
        station_id = inputs["input"][2]

        key = (station_id, image_type)
        self.data[key][component] = image_string
        if len(self.data[key]) != 3:
             
            return

        value = self.data[key]
        del self.data[key]
         
        self.write('output',[station_id, image_type, value, output_folder],metadata={'station_id': station_id})

         


class MergeImagesPE(IterativePE):
    def __init__(self):
        IterativePE.__init__(self)

    def _process(self, data):
        station_id, image_type, images, output_folder = data

        self.log("Merging name %s type %s" % (station_id, image_type))
        result = stack_images(images)
        filename = "%s-%s.png" % (image_type, station_id)
        filename = os.path.join(output_folder, filename)
        result.save(filename, "PNG")
        #result.close()
        self.write('output',filename,metadata={'station_id': station_id, 'image_type':image_type},format='image/png',location="file://"+socket.gethostname()+"/"+str(filename))


def stack_images(images):
    max_width = 0
    total_height = 0
    parts = []

    bufs = []
     
    for key, value in images.items():
        #print "KEY: "+str(key)
        buf = io.BytesIO(value)
        im = Image.open(buf)
        bufs.append(buf)
        images[key] = im

    for label in sorted(images.keys()):
        im = images[label]
        (width, height) = im.size
        max_width = max(max_width, width)
        total_height += height
        parts.append((label, im, height))
    result = Image.new("RGBA", (max_width, total_height))
    current_height = 0
    for label, im, height in parts:
        result.paste(im, (0, current_height))
        current_height += height
    return result


class ExtractMetadataPE(GenericPE):
    def __init__(self):
        GenericPE.__init__(self)
        self._add_input('input')
        self._add_output('times')
        self._add_output('metadata')

    def _process(self, inputs):
        record_type = inputs["input"]["record_type"]
        del inputs["input"]["record_type"]
        log_stuff = inputs["input"]
        print(record_type, log_stuff)


class MisfitPE(GenericPE):
    """
    PE calculating time frequency misfits.
    """
    def __init__(self):
        GenericPE.__init__(self)
        self._add_input("input")
        self._add_output("misfit_values")
        self._add_output("image")

    def _process(self, inputs):
        self.log("In process Misfit")
        ip = inputs["input"]

        syn = ip["synthetic_trace"]
        obs = ip["data_trace"]
        param = ip["parameters"]

        self.log("Starting misfit %s, freqmin %s freqmax %s" %
                 (obs.id, param["min_period"], param["max_period"]))
        nf = 100

        # Plot.
        fig = plotTfMisfits(
            obs.data, syn.data,
            dt=obs.stats.delta,
            nf=nf,
            fmin=1.0 / param["max_period"],
            fmax=1.0 / param["min_period"],
            w0=param["wavelet_parameter"],
            show=False)

        # Calculate misfit values again.
        pm_inf = pm(
            obs.data, syn.data,
            dt=obs.stats.delta,
            nf=nf,
            fmin=1.0 / param["max_period"],
            fmax=1.0 / param["min_period"],
            w0=param["wavelet_parameter"])

        em_inf = em(
            obs.data, syn.data,
            dt=obs.stats.delta,
            nf=nf,
            fmin=1.0 / param["max_period"],
            fmax=1.0 / param["min_period"],
            w0=param["wavelet_parameter"])
        data = ip["data_trace"]
        station_id = "%s.%s" % (data.stats.network,
                                data.stats.station)
        component = data.stats.channel[-1]

        # Metadata for Alessandro!
        meta = [{
            "type": "time_frequency_misfit",
            "station_id": station_id,
            "component": component,
            "phase_misfit": pm_inf,
            "envelope_misfit": em_inf
        }]

     #   self.write("misfit_values", {
     #       "record_type": "time_frequency_misfit",
     #       "output_folder": ip["output_folder"],
     #       "station_id": station_id,
     #       "component": component,
     #       "phase_misfit": pm_inf,
     #       "envelope_misfit": em_inf},metadata=metadata)
        
        fig.suptitle("Component:" + component, fontsize=15)
        with io.BytesIO() as buf:
            fig.savefig(buf)
            buf.seek(0, 0)
            # Not Python 3 compatible but who cares.
            image_string = buf.read()
        plt.close(fig)
        image_type = "time_frequency_misfit"
        self.write(
            "image",
            ({"image_string": image_string, "component": component,
              "output_folder": ip["output_folder"]},
             image_type, station_id),metadata=meta)

graph = WorkflowGraph()

producer_PE = StreamProducer()
producer_PE.name = "streamProducer"
pyflex_PE = PyflexPE()
misfit_PE = MisfitPE()
match_PE = MatchComponents()
extract_metadata_PE = ExtractMetadataPE()
window_tapering_PE = WindowTaperingPE()
merge_images_PE = MergeImagesPE()


# Start and distribute to either pyflex or straight misfit calculations.
graph.connect(producer_PE, "output_pyflex", pyflex_PE, "input")
graph.connect(producer_PE, "output_time_frequency", misfit_PE, "input")
graph.connect(pyflex_PE, "image", match_PE, "input")
#graph.connect(pyflex_PE, "windows", extract_metadata_PE, "input")
graph.connect(pyflex_PE, "window_tapering", window_tapering_PE, "input")
graph.connect(window_tapering_PE, "output", misfit_PE, "input")
#graph.connect(misfit_PE, "misfit_values", extract_metadata_PE, "input")
graph.connect(misfit_PE, "image", match_PE, "input")
graph.connect(match_PE, "output", merge_images_PE, "input")


injectProv(graph,SeismoPE)
injectProv(graph, (SeismoPE,), save_mode=ProvenancePE.SAVE_MODE_FILE,controlParameters={'username':os.environ['USER_NAME'],'runId':os.environ['RUN_ID'],'outputdest':os.environ['STAGED_DATA']})


#injectProv(graph,SeismoPE)
#InitiateNewRun(graph,ProvenanceRecorderToServiceBulk,provImpClass=SeismoPE,input=[{'ff':'1','blah':'3'}],username="aspinuso",workflowId="173",description="description",system_id="xxxx",workflowName="misfit_postprocessing",runId="misfit_post_xx_stateful2",w3c_prov=False)
#display(graph)
