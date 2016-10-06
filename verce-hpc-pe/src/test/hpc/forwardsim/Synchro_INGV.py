from admire.verce import *
import decimal as dec

class Syncro(SeismoPreprocessingActivity):
	

	def compute(self):

		def nextpow2(n):
			"""Return smallest m such as 2**m >= n."""
			if n < 0:
				raise ValueError("Input should be >= 0")
			elif n == 0:
				return 1
			else:
				m = int(np.floor(np.log2(n)))
				if 2 ** m < n:
					m += 1
				return m
	    
	                
		def fourier_sync():
	  		n=tr.stats.npts 						#nr of points
	  		nfft = 2 ** (nextpow2(n) + 1)
	  		ndx=int(np.fix((nfft-n)/2))
	  		dum=np.concatenate((tr.data[0]*np.ones(ndx), tr.data, tr.data[len(tr.data) -1]*np.ones(ndx+1)))  
	  		df=np.fft.fft(dum,nfft)
	  		f=nfft/2.*np.linspace(0,1,nfft) 		#frequency
	  		ex=np.exp(-1j*f/nfft*remainder)
	  		z=np.fft.ifft(df * ex,nfft)
	  		dd2=z.real
	  		dd=dd2[ndx:ndx+n]
	  		return dd
	
	
		for tr in self.st:	
			delta=tr.stats.delta
	  		ms_dec=dec.Decimal(tr.stats.starttime.microsecond) # microsec of trace (dec)       
	  		dec1=dec.Decimal(str(10.**6)).quantize(dec.Decimal('0.000001'))
	  		dec2=dec.Decimal(str(delta)).quantize(dec.Decimal('0.01'))
	  		ms2s=ms_dec/dec1   									# microsec of trace expressed in sec
	  		ms2s2delta=ms2s/dec2 								# ms2s as multiple of sampling rate        
	  		remainder=float(ms2s2delta-int(ms2s2delta)) 		# decimal part of the division
			if remainder > 0:
      				data=fourier_sync()
      				tr.data=data
	    			tr.stats.starttime=tr.stats.starttime - float(remainder)*delta
	    			sys.stderr.write("SYNCRONIZE: " + str(remainder) + " " + str(tr.stats.starttime) +"\n")
      			else:
	    			sys.stderr.write("DO NOT SYNCRONIZE: " + str(remainder) + " " + str(tr.stats.starttime) +"\n")



if __name__ == "__main__":
	proc=Syncro("FourierSync")
	proc.process();       

