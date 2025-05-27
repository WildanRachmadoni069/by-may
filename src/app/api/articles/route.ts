import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "desc";

    const skip = (page - 1) * limit;

    // Build query filters
    const where: any = {};
    if (status) where.status = status;

    // Add search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get articles with pagination and filtering
    const articles = await db.article.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
    });

    // Get total count for pagination
    const totalCount = await db.article.count({ where });

    return NextResponse.json({
      data: articles,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    // Set published date if status is "published"
    if (data.status === "published") {
      data.publishedAt = new Date();
    }

    // Create the article
    const article = await db.article.create({
      data,
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("Failed to create article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
