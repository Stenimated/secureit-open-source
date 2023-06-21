import { Injectable } from "@nestjs/common";
import { SaveOptions, Storage, UploadOptions } from "@google-cloud/storage";

const BUCKETS = {
  PROFILE_IMAGE: "profile-images",
  COMPANY_LOGO: "company-logos",
  PRODUCT_IMAGE: "product-images",
  PDF: "product-pdfs",
  PDF_COVER: "product-pdf-covers",
} as const;

@Injectable()
export class StorageService {
  storage: Storage;

  constructor() {
    console.log(process.env);
    this.storage = new Storage({
      projectId: `14926735051`,
      keyFilename: "credentials/gcp-key-file.json",
    });
  }

  async uploadFile(
    bucketName: keyof typeof BUCKETS,
    localFile: Express.Multer.File,
    path: string,
    options: SaveOptions,
  ) {
    const fileFormat = localFile.originalname.split(".").pop();
    const file = await this.storage.bucket("secure-it").file(
      `${bucketName}/${path}.${fileFormat}`,
    );
    await file.save(localFile.buffer, options);
    return file;
  }

  async deleteFile(bucketName: keyof typeof BUCKETS, fileName: string) {
    await this.storage.bucket(`secure-it`).file(`${bucketName}/${fileName}`)
      .delete({
        ignoreNotFound: true,
      });
  }

  async get(bucketName: keyof typeof BUCKETS, path: string) {
    return this.storage.bucket("secure-it").file(`${bucketName}/${path}`);
  }
}
