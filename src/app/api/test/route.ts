import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // console.log(req.formData())
    // console.log(req.body)
    // console.log(req.blob())
    console.log(await req.json())
    // console.log(req.text())
    return NextResponse.json({HI: "success"})
}