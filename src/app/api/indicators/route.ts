import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const res = await fetch("https://mindicador.cl/api", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch from mindicador.cl: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json({
      uf: data.uf?.valor || null,
      utm: data.utm?.valor || null,
      dolar: data.dolar?.valor || null,
    });
  } catch (error) {
    console.error("Error fetching indicators in proxy:", error);
    return NextResponse.json(
      { error: "Failed to fetch indicators" },
      { status: 500 }
    );
  }
}
