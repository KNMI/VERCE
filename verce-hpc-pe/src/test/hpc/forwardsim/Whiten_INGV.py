from admire.verce import *
import sys
import random

class Whiten_INGV(SeismoPreprocessingActivity):
		
	

	def compute(self):
		
			
			
			
		def whiten(tr,flo,fhi):
	
		# data = data vector
		# nsamp = sampling frequency [samples per sec]
		# flo = lower frequency in Hz
		# fhi = higher frequency in Hz
		# bianca whiten data out of freq range [flo,fhi]
			
			n=len(tr.data)
			frange=float(fhi)-float(flo)
			nsmo=int(np.fix(min(0.01,0.5*(frange))*float(n)/nsamp))
			f=np.arange(n)*nsamp/(n-1.)
			JJ=((f>float(flo))&(f<float(fhi))).nonzero()[0]
				
		# signal FFT
			FFTs=np.fft.fft(tr.data)
			FFTsW=np.zeros(n) + 1j *np.zeros(n)

			# Apodization to the left with cos^2 (to smooth the discontinuities)
			smo1=(np.cos(np.linspace(np.pi/2,np.pi,nsmo+1))**2)
			FFTsW[JJ[0]:JJ[0]+nsmo+1] = smo1* np.exp(1j*np.angle(FFTs[JJ[0]:JJ[0]+nsmo+1]))

		# Porte
			FFTsW[JJ[0]+nsmo+1:JJ[-1]-nsmo] = np.ones(len(JJ)-2*(nsmo+1))*np.exp(1j*np.angle(FFTs[JJ[0]+nsmo+1:JJ[-1]-nsmo]))

		# Apodization to the right with cos^2 (to smooth the discontinuities)
			smo2=(np.cos(np.linspace(0.,np.pi/2.,nsmo+1.))**2.)
			espo=np.exp(1j*np.angle(FFTs[JJ[-1]-nsmo:JJ[-1]+1]))
			FFTsW[JJ[-1]-nsmo:JJ[-1]+1]=smo2*espo

			whitedata=2.*np.fft.ifft(FFTsW).real
		
			return whitedata

		
		flo="%s" % float(self.parameters["flo"],)   
		fhi="%s" % float(self.parameters["fhi"],)
#		flo=0.01
#		fhi=1.0
		
		
		for tr in self.st:
			nsamp=1./tr.stats.delta
			tr.data=whiten(tr,flo,fhi)
		
		 
#		self.st.port="ff";
		
		
		
#		self.st.annotations.update({"featurez": 4})

		return "true"

        
if __name__ == "__main__":
	proc=Whiten_INGV("Whiten INGV")
	proc.process();

