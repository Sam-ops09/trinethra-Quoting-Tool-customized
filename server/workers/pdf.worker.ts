import { parentPort, workerData } from 'worker_threads';
import { PDFService } from '../services/pdf.service';
import { PassThrough } from 'stream';

if (!parentPort) {
    throw new Error("This file must be run as a worker thread");
}

parentPort.on('message', async (data: any) => {
  try {
    // Determine the action or just assume it is "generateQuotePDF" for now
    // We expect 'data' to be the QuoteWithDetails object directly
    
    const stream = new PassThrough();
    const chunks: Buffer[] = [];
    
    stream.on('data', (chunk) => chunks.push(chunk));
    
    const done = new Promise<void>((resolve, reject) => {
        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
    });

    // Generate PDF
    await PDFService.generateQuotePDF(data, stream);
    
    // Wait for stream to finish
    await done;
    
    const buffer = Buffer.concat(chunks);
    
    // Send back the buffer
    parentPort!.postMessage({ status: 'success', buffer });
    
  } catch (error: any) {
    console.error("Worker Error:", error);
    parentPort!.postMessage({ status: 'error', error: error.message || String(error) });
  }
});
