  //the list of stations<br>  
  String[] stations={<span id="changeable1" class="changeable">"AQU","TERO","CAMP"</span>};<br>  
  String[] networks={<span id="changeable2" class="changeable">"MN","IV","IV"</span>};<br>  
  String channel="HHZ";<br>    
  String plotLocation="/<%=	themeDisplay.getUser().getScreenName()	%>/xx/plot/";<br>  
  String dataLocation="/<%=	themeDisplay.getUser().getScreenName()	%>/xx/data/";<br><br>    
  
  //at the moment we consider a single provider<br>  
  String[] providers={"WaveformArchive0","WaveformArchive1","WaveformArchive2"};<br>  
  String[] datamount={"MonetShared0","MonetShared1","MonetShared2"};<br>  
  String[] preprocessRes={"SeismoPreprocessed0","SeismoPreprocessed1","SeismoPreprocessed2"};<br>  
  String[] dbMetadataRes={"RespResource"};<br>  <br>  
  
  String provenanceRes={"ProvenanceDb0","ProvenanceDb1","ProvenanceDb2"};<br><br>  
   
 
  //serializes the initial time window into smaller chunks  suitable for stacking<br>  
  TimeSampler sampler = new TimeSampler;<br>  
  sampler@executionEngine="node0Engine";<br>  <br>  
  
  |-["starttime=2011-05-01T00:00:00.000000Z","endtime=2011-05-01T05:00:00.000000Z","duration=1"]-|=>sampler.parameters;<br>  
  ProvenanceRecorder provSamp = new ProvenanceRecorder;<br>  
  |-provenanceRes[0]-|=>provSamp.resource;<br>  
  |- repeat enough of REQUEST_ID -|=>provSamp.processid;<br>  
  sampler.metadata=>provSamp.metastring[0];<br>  <br>  
  
  DeliverToNull itnull= new DeliverToNull;<br>  <br>  
 
  SeismoPipeline [] seismoWorkers=new SeismoPipeline [stations.length];<br>  <br>  

  Integer k =0;<br>  
  for(Integer i = 0;i<stations.length;i++)  {<br>  
      k= i % preprocessRes.length;<br>  
     Integer index=k;<br>  
     String engine="node"+k+"Engine";<br> <br>       
     
    PE<SeismoStage> PlotPE= WaveformPlotF(plotLocation, provenanceRes[k],preprocessRes[k],true);<br>  
    PE<SeismoStage> SpectrumPE= SpectrumPlotF(1,0.90,0,plotLocation, provenanceRes[k],preprocessRes[k]);<br>  
    PE<SeismoStage> WFStorePE = StoreWaveformDataF(dataLocation,provenanceRes[k],preprocessRes[k]);<br>  <br>  
   
    //Generates a Composite with a list of processes running in parallel to the main one.<br>  
    Integer f=2;<br>  
    PE<SeismoStage> [] pprocList = new  PE<SeismoStage>[f];<br>  
    pprocList[0]=PlotPE;<br>  
    pprocList[1]=WFStorePE;<br>  <br>  
  
    PE<SeismoStage> FilterPE= FilterF(provenanceRes[k],engine);<br>  
    PE<SeismoStage> WFextractPE = extractWFTimeSeries(providers[k],provenanceRes[k],channel, stations[i],"",engine);<br>  
    PE<SeismoStage> WFextractDBPE = extractWFTimeSeriesDBF(datamount[k],provenanceRes[k],channel, stations[i],networks[i],engine);<br>  
    PE<SeismoStage> SplitPE= SplitWaveformStreamF(1800,provenanceRes[k],engine);<br>  
    PE<SeismoStage> SyncPE= SynchronizeF(provenanceRes[0],engine);<br>  
    PE<SeismoStage> ResINGV= ResamplingINGVF(2.0,provenanceRes[0],engine,pprocList);<br>  
    PE<SeismoStage> TempNPE= TemporalNormF(1.5,2.0,2,"1bit",provenanceRes[k],engine,null);<br>  
    PE<SeismoStage> DtrendNPELin= DetrendF("linear",provenanceRes[k],engine,null);<br>  
    PE<SeismoStage> DtrendNPEDem= DetrendF("demean",provenanceRes[k],engine,null);<br>  <br>  
    
    
    
    
    PE<SeismoStage> WhitenPE= WhitenF(0.01,1.0, provenanceRes[k],engine,null);<br>  
   
    PE<SeismoStage> FillGapsPE= FillGapsF(20,3600, provenanceRes[k],engine,null);<br>  
  
   PE<SeismoStage> InstrumentCorrectionPE= removeInstrument(stations[i],channel, dbMetadataRes[0],provenanceRes[0],engine);<br> <br>   
   
  
     
  
    
    Integer s=7;<br>  
    PE<SeismoStage> [] stages = new  PE<SeismoStage>[s];<br>  <br>  
   
    stages[0]=WFextractDBPE;<br>  
    stages[1]=SyncPE;   <br>  
    stages[2]=FillGapsPE;<br>  
    stages[3]=DtrendNPEDem;<br>  
    stages[4]=DtrendNPELin;<br>  
    stages[5]=WhitenPE;<br>  
    stages[6]=TempNPE;<br>  <br>  
       
    
    
    PE<SeismoPipeline> SeismoProcessPipelinePE = makeArrayPipeline(stages);<br>  
    SeismoProcessPipelinePE seismoWorker= new SeismoProcessPipelinePE;<br>  
    seismoWorker@executionEngine=engine;<br>  
    sampler.timeintervals=>seismoWorker.input;<br>  
    provSamp.lineageout=>seismoWorker.lineagein;<br>  <br>  
   
    
    DeliverToNull tnull= new DeliverToNull;<br>  
    seismoWorker.lineageout=>tnull.input;<br>  
    DeliverToNull tnull2= new DeliverToNull;<br>  
    seismoWorker.residue=>tnull2.input;<br>  <br>  
   
    seismoWorkers[i]= seismoWorker;<br>  <br>  
    
    DeliverToNull tnull3= new DeliverToNull;<br>  
    seismoWorker.metadata=>tnull3.input;<br>
    
   
  
    

  }  <br>  <br>  

  

  Integer n=stations.length;<br>  
  Integer h=0;<br>  
  Integer currentNode=0;<br>  
  String xcorrid="demoxx";<br>  <br>  
    
for(Integer x=0;x<n;x++){<br>  
  
h= x % preprocessRes.length;<br>  
String engine="node"+h+"Engine";<br>  
   for(Integer y=x+1;y<n;y++){<br>  <br>  
    
   //Generates a Composite with a list of processes running in parallel to the main one.<br>  
     Integer f=1;<br>  
  
     PE<SeismoStage> StackPlotPE= StackPlotF(2.0,xcorrid+"_"+stations[x]+"_"+stations[y],plotLocation, provenanceRes[h],preprocessRes[h]);<br>  
     PE<SeismoStage> [] pprocList = new  PE<SeismoStage>[f];<br>  
     pprocList[0]=StackPlotPE;<br>  
  
     PE<SeismoStage> ArrayStackingPE = ArrayStackingF(xcorrid+"_"+stations[x]+"_"+stations[y],provenanceRes[h],preprocessRes[h],pprocList);<br>  
     PE<SeismoStageMulti> CrossCorrelationPE = CrossCorrelationF(5,provenanceRes[h],engine,pprocList);<br>  <br>  
     
      
    SeismoStage stacker = new SeismoStage;<br>  
    PE<SeismoStage> Stage = ArrayStackingPE;<br>  
    stacker = new Stage;<br>  <br>  
     
     
    SeismoStageMulti xCorr = new SeismoStageMulti;<br>  
    PE<SeismoStageMulti> StageM = CrossCorrelationPE;<br>  
    xCorr = new StageM;<br>  
     
    DeliverToNull tnull3= new DeliverToNull;<br>  
    DeliverToNull tnull4= new DeliverToNull;<br>  
    seismoWorkers[x].residue=>xCorr.input[0];<br>  
    seismoWorkers[y].residue=>xCorr.input[1];<br>  
    seismoWorkers[x].lineageout=>xCorr.lineagein[0];<br>  
    seismoWorkers[y].lineageout=>xCorr.lineagein[1];<br>  
    xCorr.output=>stacker.input;<br>  
    xCorr.lineageout=>stacker.lineagein;<br>  
    stacker.output=>tnull3.input;<br>  
    
    }<br>  
  }<br>  
    
submit sampler;<br>  