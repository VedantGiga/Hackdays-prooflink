import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { adminAuth } from "./firebase-admin";

export const requireFirebaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  const authHeader = request.headers.get("Authorization") || request.headers.get("authorization");
  
  console.log("[middleware] Auth Header:", authHeader ? "Present" : "Missing");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Missing Firebase Token");
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return next({
      context: {
        userId: decodedToken.uid,
        email: decodedToken.email,
      },
    });
  } catch (error) {
    console.error("Firebase token verification failed", error);
    throw new Error("Unauthorized: Invalid Token");
  }
});
