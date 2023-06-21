import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ProductService } from "./product.service";
import { Roles } from "src/util/roles";
import { AuthGuard } from "src/auth/auth.guard";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { Branch } from "database";

const createSchemaPage = z.object({
  name: z.string(),
  company_id: z.string(),
});

class CreatePage extends createZodDto(createSchemaPage) {}

const pageSchemaI18 = z.object({
  title: z.string(),
  description: z.string(),
  language: z.string(),
});

class pageI18 extends createZodDto(pageSchemaI18) {}

const pageYoutubeSchema = z.object({
  url: z.string(),
  language: z.string(),
  title: z.string(),
});

class pageYoutube extends createZodDto(pageYoutubeSchema) {}

const pagePdfSchema = z.object({
  title: z.string(),
  language: z.string(),
  type: z.string(),
});

class pagePdf extends createZodDto(pagePdfSchema) {}

@Controller("product")
export class ProductController {
  constructor(
    private productService: ProductService,
  ) {}

  @Get("search")
  async search(@Query("q") q?: string, @Query("b") Branch?: Branch) {
    if (q) {
      if (Branch) {
        if (
          Branch !== "BUILDING" && Branch !== "OTHER" && Branch !== "MEDICAL"
        ) {
          console.log(Branch);
          throw new BadRequestException();
        }
      }

      const companies = await this.productService.searchWithQuery(q, Branch);
      if (!companies) {
        throw new NotFoundException();
      }

      return companies;
    }
    throw new NotFoundException();
  }

  @Get("search/:id")
  async earchCompany(
    @Param("id") id?: string,
    @Query("lang") language?: string,
  ) {
    if (id) {
      console.log(language, id);
      const company = await (language
        ? this.productService.getProductByIdLanguageFilter(id, language)
        : this.productService.getProductById(id));
      if (!company) {
        throw new NotFoundException();
      }

      return {
        ok: true,
        company,
      };
    }
    throw new NotFoundException();
  }

  @Post("")
  @UseGuards(AuthGuard)
  @Roles("EMPLOYEE")
  async create(@Body() body: CreatePage) {
    const res = await this.productService.createProduct(
      { id: body.company_id },
      {
        name: body.name,
        is_hidden: false,
        branch: "OTHER",
      },
    );

    if (!res) {
      throw new InternalServerErrorException();
    }

    return {
      message: "Product created",
      page: res,
      ok: true,
    };
  }

  @Post("/image/:id")
  @UseGuards(AuthGuard)
  @Roles("EMPLOYEE")
  @UseInterceptors(FileInterceptor("image"))
  async createImage(
    @Body("order") body: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          // Regex for image files
          fileType: /^image\/(png|jpg|jpeg)$/,
        })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
        .build(),
    ) file: Express.Multer.File,
    @Param("id") id?: string,
  ) {
    const order = parseInt(body);
    if (id && order && file) {
      const res = await this.productService.createImage(id, order, file);

      if (!res) {
        throw new InternalServerErrorException();
      }

      return {
        message: "Image created",
        page: res,
        ok: true,
      };
    }
    throw new NotFoundException();
  }

  @Post("/video/:id")
  @UseGuards(AuthGuard)
  @Roles("EMPLOYEE")
  async createVideo(@Body() body: pageYoutube, @Param("id") id?: string) {
    console.log(body, id);
    if (id) {
      const res = await this.productService.createVideo(id, {
        url: body.url,
        language: body.language,
        title: body.title,
      });

      if (!res) {
        throw new InternalServerErrorException();
      }

      return {
        message: "Video created",
        page: res,
        ok: true,
      };
    }
    throw new NotFoundException();
  }

  @Post("/pdf/:id")
  @UseGuards(AuthGuard)
  @Roles("EMPLOYEE")
  @UseInterceptors(AnyFilesInterceptor())
  // @UseInterceptors(FileInterceptor("cover"))
  async createPdf(
    @Body() body: pagePdf,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          // Regex for image files and pdfs
          fileType: /^image\/(png|jpg|jpeg)$|pdf$/,
        }).build(),
    ) files: Express.Multer.File[],
    @Param("id") id?: string,
  ) {
    const pdf = files.find((file) => file.fieldname === "pdf");
    const cover = files.find((file) => file.fieldname === "cover");

    if (!pdf || !cover || !id) {
      throw new BadRequestException();
    }

    const res = await this.productService.createPDF(
      id,
      pdf,
      cover,
      {
        language: body.language,
        title: body.title,
        type: body.type as never,
      },
    );

    if (!res) {
      throw new InternalServerErrorException();
    }

    return {
      message: "PDF created",
      page: res,
      ok: true,
    };
  }

  @Post("i18/:id")
  @UseGuards(AuthGuard)
  @Roles("EMPLOYEE")
  async createI18(@Body() body: pageI18, @Param("id") id?: string) {
    console.log(body);
    if (id) {
      const res = await this.productService.createProductI18({
        title: body.title,
        description: body.description,
        language: body.language,
        product_page_id: id,
      });

      if (!res) {
        throw new InternalServerErrorException();
      }

      return {
        message: "site created",
        page: res,
        ok: true,
      };
    }
    throw new NotFoundException();
  }

  @Delete("i18/:id")
  @UseGuards(AuthGuard)
  @Roles("EMPLOYEE")
  async delete(@Param("id") id?: string) {
    if (id) {
      const res = await this.productService.deleteProduct(id);
      if (!res) {
        throw new InternalServerErrorException();
      }
      return {
        message: "Product deleted",
        ok: true,
        page: res,
      };
    }
    throw new NotFoundException();
  }
}
