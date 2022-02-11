import './App.css';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

function App() {
	const [file, setFile] = useState(null);

	const fileToArrBuffer = (file) =>
		new Promise((res, rej) => {
			const fileReader = new FileReader();
			fileReader.onload = () => res(fileReader.result);
			fileReader.onerror = () => rej(fileReader.error);
			fileReader.readAsArrayBuffer(file);
		});

	const downloadFile = async (blob) => {
		const URL = window.URL.createObjectURL(blob);
		const el = document.createElement('a');
		el.download = 'mydummyfile.pdf';
		el.href = URL;
		el.click();
		window.URL.revokeObjectURL(URL);
	};

	const embedImageInPdfAndDownload = async () => {
		// console.log(file);
		const pdfDoc = await PDFDocument.create();
		const buffer = await fileToArrBuffer(file);
		console.log({ buffer });
		let image;
		if (/jpe?g/i.test(file.type)) image = await pdfDoc.embedJpg(buffer);
		else if (/png/i.test(file.type)) image = await pdfDoc.embedPng(buffer);
		else throw Error('please choose a JPEG or PNG file to proceed');

		const page = pdfDoc.addPage();
		// const dims = page.getCropBox();

		// console.log(dims);

		page.drawImage(image, {
			width: image.scale(0.5).width,
			height: image.scale(0.5).height,
			// x: (dims.width - image.width) / 2,
			// y: (dims.height - image.height) / 2,
			x: 60,
			y: 60,
		});

		let b64Chunk = await pdfDoc.saveAsBase64();

		b64Chunk = 'data:application/pd;base64,' + b64Chunk;
		const blob = await (await fetch(b64Chunk)).blob();
		downloadFile(blob);
	};

	return (
		<>
			<div className='App'>
				<label htmlFor='file' className='btn-grey'>
					{' '}
					select image
				</label>

				<input
					id='file'
					type='file'
					onChange={(e) => setFile(e.target.files[0])}
					multiple={false}
					accept='image/*'
					name='file'
				/>

				{file && (
					<section>
						<img src={URL.createObjectURL(file)} alt='some_image' width={300} />

						<span> {file.name}</span>
					</section>
				)}
				{file && (
					<>
						<button className='btn-green' onClick={embedImageInPdfAndDownload}>
							{'embed image in PDF and download'}
						</button>
					</>
				)}
			</div>
		</>
	);
}

export default App;
