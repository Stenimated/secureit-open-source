import { Injectable } from "@nestjs/common";
import { Company } from "database";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class CompanyService {
  constructor(private prismaService: PrismaService) {}

  getCompanyById(id: string) {
    return this.prismaService.company.findUnique({
      where: {
        id: id,
      },
    });
  }

  createCompany(
    company: Omit<
      Company,
      "createdAt" | "updatedAt" | "image_id" | "logo" | "id"
    >,
  ) {
    return this.prismaService.company.create({
      data: company,
    });
  }

  setLogo(company: Company, imageURL: string) {
    return this.prismaService.company.update({
      where: {
        id: company.id,
      },
      data: {
        logo: {
          set: imageURL,
        },
      },
    });
  }

  searchWithQuery(q: string) {
    return this.prismaService.company.findMany({
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
        logo: true,
      },
      take: 20,
    });
  }
}
