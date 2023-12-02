import * as fs from 'fs';

export class File {
	/**
	 * @promise openFilePromise
	 *
	 * @fulfill {integer} file handle
	 * @reject {Error} error object
	 * @memberOf Palettes
	 */
	/**
	 *
	 *
	 * @returns {openFilePromise} Promise resolved when file opens
	 *
	 * @memberOf Palettes
	 */
	 async openFile(sFilename){
		return new Promise((resolve, reject)=>{
			fs.open(sFilename, 'r+', function (err, fd) {
				if (err) {
					console.error(err);
					reject();
				}
				resolve(fd);
				console.log("Reading the file");
			});
		})
	}
	async getFileProperties(sFileName){
		return new Promise((resolve, reject)=>{
			fs.stat(sFileName, (err, stats)=>{
				if (err){
					console.log(err);
					reject(err);
					return;
				}
				resolve(stats);
			})
		});
	}
}
