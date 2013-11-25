
	use  dispel.lang.Discard;
   use eu.admire.Results;  
   use eu.admire.seismo.StackPlot;
   use eu.admire.seismo.WaveformAppendAndSync;
   use uk.org.ogsadai.DeliverToNull;
   use uk.org.ogsadai.ListConcatenate;
   use uk.org.ogsadai.Tee;
   use uk.org.ogsadai.SQLQuery;
   use uk.org.ogsadai.Split;
   use uk.org.ogsadai.Echo;
   use eu.admire.seismo.TimeSampler;
   use eu.admire.seismo.FillGaps;
   use eu.admire.seismo.WFRetrieve;
  use eu.admire.seismo.WFRetrieveDB;
   use eu.admire.seismo.SplitStream;
   use eu.admire.seismo.WaveformStreamPyToSeedFile;
   use eu.admire.seismo.WaveformWhitenINGV;
   use eu.admire.seismo.WFXCorrelationStacker;
   use eu.admire.seismo.WaveformFilter;
   use eu.admire.seismo.InstrumentCorrection;
   use eu.admire.seismo.ProvenanceRecorder;
   use eu.admire.seismo.DataMetadataAppender;
   use eu.admire.seismo.RespReader;
   use eu.admire.seismo.WaveformPlot;
   use eu.admire.seismo.SpectrogramPlot;
   use eu.admire.seismo.ResampleINGV;
   use eu.admire.seismo.Detrend;
   use eu.admire.seismo.Synchronize;
   use eu.admire.seismo.TempNormalization;
   use eu.admire.seismo.XCorrelation;
   use uk.org.ogsadai.TupleToByteArrays;
   use uk.org.ogsadai.ByteArraysToTuple;
   use uk.org.ogsadai.ControlledRepeat;



   Type SeismoStage is PE(<Connection input;Connection lineagein>=><Connection lineageout;Connection output;Connection metadata>);
  
   Type SeismoStageMulti is PE(<Connection[] input;Connection[] lineagein>=><Connection lineageout;Connection output;Connection metadata>);
  
  
   Type SeismoPipeline is PE(<Connection input;Connection lineagein>=><Connection [] metadata;Connection lineageout;Connection residue>);
   
   
   //Builds the processing pipeline, new stages can be easily plugged in   
   PE <SeismoPipeline> makeArrayPipeline(PE <SeismoStage>[] TheStages) {
       Integer len = TheStages.length;
      
       SeismoStage[] stages = new SeismoStage[len];
       PE<SeismoStage> Stage = TheStages[0];
       stages[0] = new Stage;
      
       for (Integer i = 0; i<len-1; i++) {
         DeliverToNull tonull = new DeliverToNull;

         DeliverToNull tonull2 = new DeliverToNull;
         PE<SeismoStage> Stg = TheStages[i+1];
         stages[i+1] = new Stg;
         stages[i].output => stages[i+1].input;
         stages[i].lineageout => stages[i+1].lineagein;
        // stages[i].lineageout=>tonull2.input;
         stages[i].metadata=>tonull.input;
       };
      
     return SeismoPipeline( <Connection input = stages[0].input;
                               Connection lineagein = stages[0].lineagein> =>
                                <Connection metadata = stages[len-1].metadata;
                                     Connection lineageout=  stages[len-1].lineageout;
                                            Connection residue =  stages[len-1].output> );
     };
  
  
  
    PE<SeismoStage> extractWFTimeSeries(String datares, String provenanceRes, String channelCode, String station, String network, String engine)
  {
    Tee tee = new Tee;
    ListConcatenate lc1 = new ListConcatenate;
    
    
    WFRetrieve retrieve = new WFRetrieve;
   
    WaveformAppendAndSync appsyn = new WaveformAppendAndSync;
   
    ProvenanceRecorder prov1 = new ProvenanceRecorder;
    ProvenanceRecorder prov2 = new ProvenanceRecorder;
    
    |-provenanceRes-|=>prov1.resource;
    |-provenanceRes-|=>prov2.resource;
  
     |- repeat enough of REQUEST_ID -|=>prov2.processid;
     |- repeat enough of REQUEST_ID -|=>prov1.processid;
    
    
        
    
    |-datares-| => retrieve.resource;  
    |-datares-| => appsyn.resource;
    String cha="ch="+channelCode;
    String sta="sta="+station;
    String net="net="+network;
    tee.output[0]=>lc1.input[0];
    |-repeat enough of [cha,sta,net]-|=>lc1.input[1];
    lc1.output=>retrieve.parameters;
    retrieve.metadata=>prov1.metastring;
    retrieve.wflocations=>appsyn.input[0];
    tee.output[1]=>appsyn.parameters;
    appsyn.metadata=>prov2.metastring;
    prov1.lineageout=>prov2.lineagein[0];
    
    return PE(<Connection input=tee.input;Connection lineagein=prov1.lineagein[0]> => <Connection output=appsyn.output;Connection lineageout=prov2.lineageout;Connection metadata=prov2.processedMetadata>);
  };
  
  
     PE<SeismoStage> extractWFTimeSeriesDBF(String datares, String provenanceRes, String channelCode, String station, String network, String engine)
  {
    Tee tee = new Tee;
    ListConcatenate lc1 = new ListConcatenate;
    
    
    WFRetrieveDB retrieve = new WFRetrieveDB;
    retrieve@executionEngine=engine;
   
    WaveformAppendAndSync appsyn = new WaveformAppendAndSync;
   
    ProvenanceRecorder prov1 = new ProvenanceRecorder;
    ProvenanceRecorder prov2 = new ProvenanceRecorder;
    
    |-provenanceRes-|=>prov1.resource;
    |-provenanceRes-|=>prov2.resource;
  
     |- repeat enough of REQUEST_ID -|=>prov2.processid;
     |- repeat enough of REQUEST_ID -|=>prov1.processid;
    
    
        
    
     
    |-datares-| => appsyn.resource;
    String cha="ch="+channelCode;
    String sta="sta="+station;
    String net="net="+network;
    tee.output[0]=>lc1.input[0];
    |-repeat enough of [cha,sta,net]-|=>lc1.input[1];
    lc1.output=>retrieve.parameters;
    retrieve.metadata=>prov1.metastring;
    retrieve.output=>appsyn.input[0];
    tee.output[1]=>appsyn.parameters;
    appsyn.metadata=>prov2.metastring;
    prov1.lineageout=>prov2.lineagein[0];
    
    return PE(<Connection input=tee.input;Connection lineagein=prov1.lineagein[0]> => <Connection output=appsyn.output;Connection lineageout=prov2.lineageout;Connection metadata=prov2.processedMetadata>);
  };
  
  
  
  PE<SeismoStage> removeInstrument(String station,String channel, String datares,String provenanceRes,String engine){  

       RespReader reader=new RespReader;
          TupleToByteArrays tba=new TupleToByteArrays;
          tba@executionEngine="node0Engine";  
       reader@executionEngine="node0Engine";
       ProvenanceRecorder prov1 = new ProvenanceRecorder;
       InstrumentCorrection inCorr = new InstrumentCorrection;
       inCorr@executionEngine=engine;
   
       |-provenanceRes-|=>prov1.resource;
       |- repeat enough of REQUEST_ID -|=>prov1.processid;
       |-["sta="+station,"ch="+channel]-|=>reader.parameters;
         |-datares-|=>reader.resource;
   
   
        ByteArraysToTuple bat=new ByteArraysToTuple;
        bat@executionEngine=engine;
       ControlledRepeat rp = new ControlledRepeat;
       rp@executionEngine=engine;
       reader.output=>tba.data;
       |-5120-|=>tba.size;
       tba.result=>bat.data;
       bat.result=>rp.repeatedInput;
  
       rp.output=>inCorr.input;
   
   
       inCorr.metadata=>prov1.metastring;
      |-repeat enough of ["paz_simulate=None","remove_sensitivity=True","zero_mean=False","0.00588,0.00625,30.,35.","nfft_pow2=False","pre_filt=0.00588, 0.00625, 30.,35."]-|=>inCorr.parameters;
      rp.repeatedOutput=> inCorr.responsepaz;
   
   return PE(<Connection input=rp.input[0];Connection lineagein=prov1.lineagein[0]> => <Connection lineageout=prov1.lineageout;Connection output=inCorr.output;Connection metadata=prov1.processedMetadata> );
  };
   

  
 

  
  //Generates a CompositePE executing a list of CompositePEs in parallel to the main PE.
  
   PE<SeismoStage> WhitenF(Real flo,
                   Real fhi,
                   String provenanceRes,
                   String engine,
                   PE <SeismoStage> [] pprocList){
    
    ProvenanceRecorder prov1 = new ProvenanceRecorder;
    WaveformWhitenINGV proc=new WaveformWhitenINGV;
    |-provenanceRes-|=>prov1.resource;
    |- repeat enough of REQUEST_ID -|=>prov1.processid;
    |- repeat enough of ["flo="+flo,"fhi="+fhi]-|=>proc.parameters;
    proc.metadata=>prov1.metastring;
  
   if(pprocList!=null)
   {
   Integer len = pprocList.length;
   
   for (Integer i = 0; i<len; i++) {
       DeliverToNull tnull1 = new DeliverToNull;
       DeliverToNull tnull2 = new DeliverToNull;
       DeliverToNull tnull3 = new DeliverToNull;
       SeismoStage pproc = new SeismoStage;
       PE<SeismoStage> Stage = pprocList[i];
       pproc = new Stage;
       proc.output=>pproc.input;
       prov1.lineageout=>pproc.lineagein;
       pproc.output=>tnull1.input;
       pproc.metadata=>tnull2.input;
       pproc.lineageout=>tnull3.input;
   }
   }
     
    return SeismoStage(<Connection input=proc.input[0];Connection lineagein=prov1.lineagein[0]>=><Connection lineageout=prov1.lineageout;Connection output=proc.output;Connection metadata=proc.metadata>);   
  
  };
  
    PE<SeismoStage> FillGapsF(Real pergap,
                   Real unitl,
                   String provenanceRes,
                   String engine,
                   PE <SeismoStage> [] pprocList){
    
    ProvenanceRecorder prov1 = new ProvenanceRecorder;
    FillGaps proc=new FillGaps;
    |-provenanceRes-|=>prov1.resource;
    |- repeat enough of REQUEST_ID -|=>prov1.processid;
    |- repeat enough of ["pergap="+pergap,"unitl="+unitl]-|=>proc.parameters;
    proc.metadata=>prov1.metastring;
    proc@executionEngine=engine;
  
   if(pprocList!=null)
   {
   Integer len = pprocList.length;
   
   for (Integer i = 0; i<len; i++) {
       DeliverToNull tnull1 = new DeliverToNull;
       DeliverToNull tnull2 = new DeliverToNull;
       DeliverToNull tnull3 = new DeliverToNull;
       SeismoStage pproc = new SeismoStage;
       PE<SeismoStage> Stage = pprocList[i];
       pproc = new Stage;
       proc.output=>pproc.input;
       prov1.lineageout=>pproc.lineagein;
       pproc.output=>tnull1.input;
       pproc.metadata=>tnull2.input;
       pproc.lineageout=>tnull3.input;
   }
   }
    
    return SeismoStage(<Connection input=proc.input[0];Connection lineagein=prov1.lineagein[0]>=><Connection lineageout=prov1.lineageout;Connection output=proc.output;Connection metadata=proc.metadata>);   
  
  };
  
  
  
  
  PE<SeismoStage> DetrendF(String method,
                   String provenanceRes,
                   String engine,
                   PE <SeismoStage> [] pprocList){
    
    ProvenanceRecorder prov1 = new ProvenanceRecorder;
    Detrend proc=new Detrend;
    |-provenanceRes-|=>prov1.resource;
    |- repeat enough of REQUEST_ID -|=>prov1.processid;
    |- repeat enough of ["method="+method]-|=>proc.parameters;
    proc.metadata=>prov1.metastring;
    proc@executionEngine=engine;
  
  
   if(pprocList!=null)
   {
   Integer len = pprocList.length;
   
   for (Integer i = 0; i<len; i++) {
       DeliverToNull tnull1 = new DeliverToNull;
       DeliverToNull tnull2 = new DeliverToNull;
       DeliverToNull tnull3 = new DeliverToNull;
       SeismoStage pproc = new SeismoStage;
       PE<SeismoStage> Stage = pprocList[i];
       pproc = new Stage;
       proc.output=>pproc.input;
       prov1.lineageout=>pproc.lineagein;
       pproc.output=>tnull1.input;
       pproc.metadata=>tnull2.input;
       pproc.lineageout=>tnull3.input;
   }
   }
    
    return SeismoStage(<Connection input=proc.input[0];Connection lineagein=prov1.lineagein[0]>=><Connection lineageout=prov1.lineageout;Connection output=proc.output;Connection metadata=proc.metadata>);   
  
  };
  
  
  
 
  
 
  
  
    PE<SeismoStage> TemporalNormF(Real clip_factor,
                   Real clip_weight,
                   Real norm_win,
                   String norm_method,
                   String provenanceRes,
                   String engine,
                   PE <SeismoStage> [] pprocList){
    
    TempNormalization proc=new TempNormalization;
    ProvenanceRecorder prov1 = new ProvenanceRecorder;
    |-provenanceRes-|=>prov1.resource;
    |- repeat enough of REQUEST_ID -|=>prov1.processid;
    |- repeat enough of     ["clip_factor="+clip_factor,"clip_weight="+clip_weight,"norm_win="+norm_win,"norm_method="+norm_method]-|=>proc.parameters;
    proc.metadata=>prov1.metastring;
   
    proc@executionEngine=engine;
    
  
  
 if(pprocList!=null)
   {
   Integer len = pprocList.length;
   
   for (Integer i = 0; i<len; i++) {
       DeliverToNull tnull1 = new DeliverToNull;
       DeliverToNull tnull2 = new DeliverToNull;
       DeliverToNull tnull3 = new DeliverToNull;
       SeismoStage pproc = new SeismoStage;
       PE<SeismoStage> Stage = pprocList[i];
       pproc = new Stage;
       proc.output=>pproc.input;
       prov1.lineageout=>pproc.lineagein;
       pproc.output=>tnull1.input;
       pproc.metadata=>tnull2.input;
       pproc.lineageout=>tnull3.input;
   }
   }
    
    return SeismoStage(<Connection input=proc.input[0];Connection lineagein=prov1.lineagein[0]>=><Connection lineageout=prov1.lineageout;Connection output=proc.output;Connection metadata=proc.metadata>);   
  
  };
   
   
  
   PE<SeismoStage> WaveformPlotF(String plotLocation, String provenanceRes,String preprocessRes,Boolean traceit){
    
    Echo echoin = new Echo;
    Echo echoout = new Echo;
    ProvenanceRecorder prov = new ProvenanceRecorder;
    WaveformPlot plot=new WaveformPlot;
    
  if (traceit) {
  
    |-provenanceRes-|=>prov.resource;
    |- repeat enough of REQUEST_ID -|=>prov.processid;
   
    plot.metadata=>prov.metastring;
    echoin.output=>prov.lineagein;
    prov.lineageout=>echoout.input;
  }
  else
   {
     DeliverToNull tonull = new DeliverToNull;
     plot.metadata=>tonull.input;
     echoin.output=>echoout.output;
   }
  
  |-repeat enough of ["filedestination="+plotLocation]-|=>plot.parameters;
  |-preprocessRes-|=>plot.resource;
   
    return SeismoStage(<Connection input=plot.input[0];Connection lineagein=echoin.input>=><Connection lineageout=echoout.output;Connection output=plot.output;Connection metadata=plot.metadata>);   
  
  };
  
  
    PE<SeismoStage> SpectrumPlotF(Integer par_log,
                   Real par_perlap,
                   Real par_wlen,
                   String plotLocation,
                   String provenanceRes,
                   String preprocessRes){
    
    
    ProvenanceRecorder prov1 = new ProvenanceRecorder;
    SpectrogramPlot plot=new SpectrogramPlot;
    
    |-provenanceRes-|=>prov1.resource;
    |- repeat enough of REQUEST_ID -|=>prov1.processid;
    |-preprocessRes-|=>plot.resource;
    |-repeat enough of ["filedestination="+plotLocation,"par_log="+par_log,"par_perlap="+par_perlap,"par_wlen="+par_wlen]-|=>plot.parameters;
    plot.metadata=>prov1.metastring;
   
    return SeismoStage(<Connection input=plot.input[0];Connection lineagein=prov1.lineagein[0]>=><Connection lineageout=prov1.lineageout;Connection output=plot.output;Connection metadata=plot.metadata>);   
  
  };
  
  
  
  PE<SeismoStage> StackPlotF(Real sampling_rate,
                   String stackingid,
                   String plotLocation,
                   String provenanceRes,
                   String preprocessRes){
    
    
    ProvenanceRecorder prov1 = new ProvenanceRecorder;
    StackPlot plot=new StackPlot;
    
    |-provenanceRes-|=>prov1.resource;
    |- repeat enough of REQUEST_ID -|=>prov1.processid;
    |-preprocessRes-|=>plot.resource;
    |-repeat enough of ["filedestination="+plotLocation,"sampling_rate="+sampling_rate,"stackingid="+stackingid]-|=>plot.parameters;
    plot.metadata=>prov1.metastring;
   
    return SeismoStage(<Connection input=plot.input[0];Connection lineagein=prov1.lineagein[0]>=><Connection lineageout=prov1.lineageout;Connection output=plot.output;Connection metadata=plot.metadata>);   
  
  };
  
 
  
    PE<SeismoStage> ResamplingINGVF(Real sampling_rate,
                   String provenanceRes,
                   String engine,
                   PE <SeismoStage> [] pprocList){
    
    ResampleINGV proc=new ResampleINGV;
    ProvenanceRecorder prov1 = new ProvenanceRecorder;
    |-provenanceRes-|=>prov1.resource;
    |- repeat enough of REQUEST_ID -|=>prov1.processid;
    |- repeat enough of ["sampling_rate="+sampling_rate]-|=>proc.parameters;
    proc.metadata=>prov1.metastring;
    proc@executionEngine=engine;
    
  
  
  if(pprocList!=null)
   {
   Integer len = pprocList.length;
   
   for (Integer i = 0; i<len; i++) {
       DeliverToNull tnull1 = new DeliverToNull;
       DeliverToNull tnull2 = new DeliverToNull;
       DeliverToNull tnull3 = new DeliverToNull;
       SeismoStage pproc = new SeismoStage;
       PE<SeismoStage> Stage = pprocList[i];
       pproc = new Stage;
       proc.output=>pproc.input;
       prov1.lineageout=>pproc.lineagein;
       pproc.output=>tnull1.input;
       pproc.metadata=>tnull2.input;
       pproc.lineageout=>tnull3.input;
   }
   }
    
    return SeismoStage(<Connection input=proc.input[0];Connection lineagein=prov1.lineagein[0]>=><Connection lineageout=prov1.lineageout;Connection output=proc.output;Connection metadata=proc.metadata>);   
  
  };
  
  
  

  
  
   
  
  
PE<SeismoStage> SynchronizeF(String provenanceRes,String engine){
    
     ProvenanceRecorder prov1 = new ProvenanceRecorder;
     Synchronize proc = new Synchronize;  
     proc@executionEngine=engine;
     
     |-provenanceRes-|=>prov1.resource;
     |- repeat enough of REQUEST_ID -|=>prov1.processid;
     
     proc.metadata=>prov1.metastring;
     
     return SeismoStage(<Connection input=proc.input[0];Connection lineagein=prov1.lineagein[0]> => <Connection lineageout=prov1.lineageout;Connection output=proc.output;Connection metadata=proc.metadata>);
  
  };  
  
  
    PE<SeismoStage> SplitWaveformStreamF(Integer delta,String provenanceRes,String engine){
    
     ProvenanceRecorder prov1 = new ProvenanceRecorder;
     SplitStream proc = new SplitStream;  
     proc@executionEngine=engine;
     
     |-provenanceRes-|=>prov1.resource;
     |- repeat enough of REQUEST_ID -|=>prov1.processid;
     |-repeat enough of ["delta="+delta]-|=>proc.parameters;
     
     proc.metadata=>prov1.metastring;
     
     return SeismoStage(<Connection input=proc.input[0];Connection lineagein=prov1.lineagein[0]> => <Connection lineageout=prov1.lineageout;Connection output=proc.output;Connection metadata=prov1.processedMetadata>);
  
  };
   
   PE<SeismoStage> FilterF(String provenanceRes,String engine){
    
     ProvenanceRecorder prov1 = new ProvenanceRecorder;
     WaveformFilter filter = new WaveformFilter;  
     filter@executionEngine=engine;
     
     |-provenanceRes-|=>prov1.resource;
     |- repeat enough of REQUEST_ID -|=>prov1.processid;
     |-repeat enough of ["filtertype=bandpass","minfrequency=0.05","maxfrequency=1","corners=1","zerophase=True","remove_sensitivity=True"]-|=>filter.parameters;
     
     filter.metadata=>prov1.metastring;
     
     return SeismoStage(<Connection input=filter.input[0];Connection lineagein=prov1.lineagein[0]> => <Connection lineageout=prov1.lineageout;Connection output=filter.output;Connection metadata=prov1.processedMetadata>);
  
  };
   
   
   PE<SeismoStage> StoreWaveformDataF(String dataLocation, String provenanceRes,String preprocessRes){
     DeliverToNull tonull = new DeliverToNull;
     ProvenanceRecorder prov1 = new ProvenanceRecorder;
     WaveformStreamPyToSeedFile prepocstore = new WaveformStreamPyToSeedFile;
    
     |-repeat enough of ["filedestination="+dataLocation]-|=>prepocstore.parameters;
     |-provenanceRes-|=>prov1.resource;
     |-preprocessRes-|=>prepocstore.resource;
     |- repeat enough of REQUEST_ID -|=>prov1.processid;

     prepocstore.metadata=>prov1.metastring;
  
    return SeismoStage(<Connection input=prepocstore.input[0];Connection lineagein=prov1.lineagein[0]>=><Connection lineageout=prov1.lineageout;Connection output=prepocstore.output;Connection metadata=prepocstore.metadata>);
  
  };

  
  
  
  
  PE<SeismoStage> ArrayStackingF(String stackingid,
                   String provenanceRes,
                   String preprocessRes,
                   PE <SeismoStage> [] pprocList){
    
    ProvenanceRecorder prov1 = new ProvenanceRecorder;
    WFXCorrelationStacker proc=new WFXCorrelationStacker;
    |-preprocessRes-|=>proc.resource;
    |-provenanceRes-|=>prov1.resource;
    |- repeat enough of REQUEST_ID -|=>prov1.processid;
    |- repeat enough of ["stackingid="+stackingid]-|=>proc.parameters;
    proc.metadata=>prov1.metastring;
  
   if(pprocList!=null)
   {
   Integer len = pprocList.length;
   
   for (Integer i = 0; i<len; i++) {
       DeliverToNull tnull1 = new DeliverToNull;
       DeliverToNull tnull2 = new DeliverToNull;
       DeliverToNull tnull3 = new DeliverToNull;
       SeismoStage pproc = new SeismoStage;
       PE<SeismoStage> Stage = pprocList[i];
       pproc = new Stage;
       proc.output=>pproc.input;
       prov1.lineageout=>pproc.lineagein;
       pproc.output=>tnull1.input;
       pproc.metadata=>tnull2.input;
       pproc.lineageout=>tnull3.input;
   }
   }
    
    return SeismoStage(<Connection input=proc.input[0];Connection lineagein=prov1.lineagein[0]>=><Connection lineageout=prov1.lineageout;Connection output=proc.output;Connection metadata=proc.metadata>);   
  
  };
  
  
  
  
  
  
  PE<SeismoStageMulti> CrossCorrelationF(Integer timeShift,
                   String provenanceRes,
                   String engine,
                   PE <SeismoStage> [] pprocList){
    
    ProvenanceRecorder prov1 = new ProvenanceRecorder;
    XCorrelation proc=new XCorrelation;
    
    |-provenanceRes-|=>prov1.resource;
    |- repeat enough of REQUEST_ID -|=>prov1.processid;
    |- repeat enough of ["time-shift="+timeShift]-|=>proc.parameters;
    proc.metadata=>prov1.metastring;
    proc@executionEngine=engine;
  
   if(pprocList!=null)
   {
   Integer len = pprocList.length;
   
   for (Integer i = 0; i<len; i++) {
       DeliverToNull tnull1 = new DeliverToNull;
       DeliverToNull tnull2 = new DeliverToNull;
       DeliverToNull tnull3 = new DeliverToNull;
       SeismoStage pproc = new SeismoStage;
       PE<SeismoStage> Stage = pprocList[i];
       pproc = new Stage;
       proc.output=>pproc.input;
       prov1.lineageout=>pproc.lineagein;
       pproc.output=>tnull1.input;
       pproc.metadata=>tnull2.input;
       pproc.lineageout=>tnull3.input;
   }
   }
    
    return SeismoStage(<Connection[] input=proc.input;Connection[] lineagein=prov1.lineagein>=><Connection lineageout=prov1.lineageout;Connection output=proc.output;Connection metadata=proc.metadata>);   
  
  };