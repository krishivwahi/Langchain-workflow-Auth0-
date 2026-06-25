import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { device_code } = await req.json();

  if (!device_code) {
    return NextResponse.json({ error: "device_code is required" }, { status: 400 });
  }

  const tenantUrl = process.env.MONOCLOUD_AUTH_TENANT_DOMAIN || "https://your-tenant.monocloud.com";
  const clientId = process.env.MONOCLOUD_AUTH_CLIENT_ID || "your-client-id";

  try {
    // 1. Hit the MonoCloud token endpoint with the device_code
    const response = await fetch(`${tenantUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        client_id: clientId,
        device_code: device_code,
      }),
    });

    const data = await response.json();

    // 2. Handle specific OAuth 2.0 Device Flow states
    if (data.error) {
      if (data.error === "authorization_pending") {
        return NextResponse.json({ status: "pending", message: "Waiting for user approval..." });
      }
      if (data.error === "slow_down") {
        return NextResponse.json({ status: "slow_down", message: "Polling too fast!" });
      }
      // Any other error (e.g. expired_token, access_denied)
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    // 3. Success! The user approved the login on their device!
    return NextResponse.json({ 
      status: "success", 
      access_token: data.access_token 
    });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
