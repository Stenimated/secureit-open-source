import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CompanyService } from "./company.service";
import { z } from "nestjs-zod/z";
import { createZodDto } from "nestjs-zod";
import { AuthGuard } from "src/auth/auth.guard";
import { Company } from "database";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "src/storage/storage.service";
import { Response } from "express";
import { Roles } from "src/util/roles";
import cuid2 from "@paralleldrive/cuid2";

const companySchema = z.object({
  address: z.string(),
  city: z.string(),
  country: z.string(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string(),
  zip: z.string(),
  website: z.string().url(),
  state: z.string(),
});

const comapnySchemaLookup = z.object({
  id: z.string(),
});

class SchemaDTO extends createZodDto(companySchema) {}
class SchemaLookupDTO extends createZodDto(comapnySchemaLookup) {}

@Controller("company")
export class CompanyController {
  constructor(
    private companyService: CompanyService,
    private Storage: StorageService,
  ) {}

  @Get("search")
  async search(@Query("q") q?: string) {
    if (q) {
      const companies = await this.companyService.searchWithQuery(q);
      if (!companies) {
        throw new NotFoundException();
      }

      return companies;
    }
    throw new NotFoundException();
  }

  @Get("search/:id")
  async earchCompany(@Param("id") id?: string, @Query("q") q?: string) {
    if (id) {
      const company = await this.companyService.getCompanyById(id);

      if (!company) {
        throw new NotFoundException();
      }

      return company;
    }
    throw new NotFoundException();
  }

  @Post("")
  @UseGuards(AuthGuard)
  @Roles("EMPLOYEE")
  async create(@Body() body: SchemaDTO) {
    console.log(body);
    const company = await this.companyService.createCompany(body as Company);
    if (company) {
      return {
        ok: true,
        message: "Company created successfully",
        company,
      };
    }
    throw new InternalServerErrorException({
      ok: false,
      message: "Failed to create company",
    });
  }

  @Post("profile-image")
  @UseGuards(AuthGuard)
  @Roles("EMPLOYEE")
  @UseInterceptors(FileInterceptor("image"))
  async uploadProfileImage(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: "image/jpeg" })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
        .build(),
    ) file: Express.Multer.File,
    @Body() body: SchemaLookupDTO,
    @Res() res: Response,
  ) {
    const companyPromise = this.companyService.getCompanyById(body.id);
    const uploadedFilePromise = this.Storage.uploadFile(
      "COMPANY_LOGO",
      file,
      cuid2.createId(),
      {
        public: true,
      },
    );

    Promise.all([companyPromise, uploadedFilePromise]).then(
      async ([company, uploadedFile]) => {
        const publicURL = uploadedFile.publicUrl();
        await this.companyService.setLogo(
          company,
          publicURL,
        );

        res.status(200).json({
          ok: true,
          message: "File uploaded successfully",
          url: publicURL,
        });
      },
    )
      .catch((err) => {
        res.status(500).json({
          ok: false,
          message: "Failed to upload file",
          internal_error: err,
        });
      });
  }
}
