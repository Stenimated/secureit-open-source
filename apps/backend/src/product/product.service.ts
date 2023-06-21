import { Injectable, NotFoundException } from "@nestjs/common";
import * as cuid2 from "@paralleldrive/cuid2";
import {
  Branch,
  Company,
  PDFProduct,
  ProductImage,
  ProductPage,
  ProductPageI18,
  Video,
} from "database";
import { PrismaService } from "src/prisma.service";
import { StorageService } from "src/storage/storage.service";
import { isValid } from "i18n-iso-countries";

@Injectable()
export class ProductService {
  constructor(
    private prismaService: PrismaService,
    private storageService: StorageService,
  ) {}

  getProductById(id: string) {
    return this.prismaService.productPage.findUnique({
      where: {
        id: id,
      },
      include: {
        product_page_i18: true,
        pdfs: true,
        video: true,
        images: true,
        company: true,
      },
    });
  }

  getProductByIdLanguageFilter(id: string, lang: string): Promise<
    ProductPage & {
      product_page_i18: ProductPageI18[];
      pdfs: PDFProduct[];
      video: Video[];
      images: ProductImage[];
      company: Company;
    }
  > {
    console.log(lang);
    return this.prismaService.productPage.findUnique({
      where: {
        id: id,
      },
      include: {
        product_page_i18: {
          where: {
            language: lang,
          },
        },
        pdfs: {
          where: {
            language: lang,
          },
        },
        video: {
          where: {
            language: lang,
          },
        },
        images: true,
        company: true,
      },
    });
  }

  createProduct(
    to: Partial<Company> & { id: string },
    product: Omit<
      ProductPage,
      "createdAt" | "updatedAt" | "image_id" | "id" | "company_id"
    >,
  ) {
    return this.prismaService.productPage.create({
      data: {
        ...product,
        company: {
          connect: {
            id: to.id,
          },
        },
      },
    });
  }

  async createVideo(
    to: string,
    data: Omit<
      Video,
      "createdAt" | "updatedAt" | "image_id" | "id" | "product_page_id"
    >,
  ) {
    const language = isValid(
      data.language,
    );

    if (!language) {
      throw new NotFoundException({
        message: "Language not found",
      });
    }

    return await this.prismaService.video.create({
      data: {
        ...data,
        product_page: {
          connect: {
            id: to,
          },
        },
      },
    });
  }

  createPDF(
    to: string,
    PDF: Express.Multer.File,
    cover: Express.Multer.File,
    data: Omit<
      PDFProduct,
      | "id"
      | "url"
      | "cover"
      | "createdAt"
      | "updatedAt"
      | "image_id"
      | "image"
      | "product_page_id"
    >,
  ) {
    // check language
    const language = isValid(data.language);

    if (!language) {
      throw new NotFoundException({
        message: "Language not found",
      });
    }

    const fileGCP = this.storageService
      .uploadFile("PDF", PDF, cuid2.createId(), { public: true });

    const coverGCP = this.storageService
      .uploadFile("PDF_COVER", cover, cuid2.createId(), { public: true });

    return Promise.all([fileGCP, coverGCP]).then((res) => {
      const file = res[0];
      const cover = res[1];

      const fileURL = file.publicUrl();
      const coverURL = cover.publicUrl();

      const promise = this.prismaService.pDFProduct.create({
        data: {
          ...data,
          url: fileURL,
          cover: coverURL,
          product_page: {
            connect: {
              id: to,
            },
          },
        },
      });

      promise.catch(() => {
        this.storageService.deleteFile("PDF", file.name);
        this.storageService.deleteFile("PDF_COVER", cover.name);
      });

      return promise;
    });
  }

  createImage(
    to: string,
    order: number,
    file: Express.Multer.File,
  ) {
    const fileGCP = this.storageService
      .uploadFile("PRODUCT_IMAGE", file, cuid2.createId(), { public: true });

    return fileGCP.then((res) => {
      const publicURL = res.publicUrl();
      const promise = this.prismaService.productImage.create({
        data: {
          order,
          url: publicURL,
          product_page: {
            connect: {
              id: to,
            },
          },
        },
      });

      promise.catch(() => {
        this.storageService.deleteFile("PRODUCT_IMAGE", res.name);
      });

      return promise;
    });
  }

  searchWithQuery(q: string, branch?: Branch) {
    if (branch) {
      console.log("branch");
      return this.prismaService.productPage.findMany({
        where: {
          branch: branch,
          AND: {
            OR: [
              {
                name: {
                  startsWith: q,
                },
              },
              {
                name: {
                  contains: q,
                },
              },
            ],
          },
        },
        select: {
          name: true,
          id: true,
          images: {
            take: 1,
          },
        },
        take: 20,
      });
    }
    return this.prismaService.productPage.findMany({
      where: {
        OR: [
          {
            name: {
              startsWith: q,
            },
          },
          {
            name: {
              contains: q,
            },
          },
        ],
      },
      select: {
        name: true,
        id: true,
        images: {
          take: 1,
        },
      },
      take: 20,
    });
  }

  async createProductI18(
    productI18: Omit<ProductPageI18, "createdAt" | "updatedAt" | "id">,
  ) {
    const language = isValid(
      productI18.language,
    );

    if (!language) {
      throw new NotFoundException({
        message: "Language not found",
      });
    }
    return await this.prismaService.productPageI18.create({
      data: productI18,
    });
  }

  deleteProduct(id: string) {
    return this.prismaService.productPage.delete({
      where: {
        id: id,
      },
    });
  }

  deleleProductI18(id: string) {
    return this.prismaService.productPageI18.delete({
      where: {
        id,
      },
    });
  }
}
