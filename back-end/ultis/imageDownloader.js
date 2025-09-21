import download from "image-downloader";
import mime from "mime-types";

export const downloadImage = async (link, destination) => {
	const mimeType = mime.lookup(link);
	const contentType = mime.contentType(mimeType);
	const extension = mime.extension(contentType);
	const filename = `${Date.now()}.${extension}`;
	const fullPath = `${destination}${filename}`;

	console.log({link, extension});

	try {
		const options = {
			url: link,
			dest: fullPath, 
			headers: {
				"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
				"Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
			},
		};

		await download.image(options);

		return filename;

	} catch (error) {
		throw error;
	}
};
