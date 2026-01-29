import { type Request, type Response } from "express";
import { loginService, registerService, getUserProfileService, refreshTokenService } from "./service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";

export const registerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      sendError(res, 400, "All fields are required");
      return;
    }

    const { user, accessToken, refreshToken } = await registerService({
      name,
      email,
      password,
    });

    sendSuccess(res, 201, "Registration successful", {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    sendError(res, 400, error.message || "Registration failed", error.message);
  }
};

export const loginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 400, "All fields are required");
      return;
    }

    const { user, accessToken, refreshToken } = await loginService({ email, password });

    sendSuccess(res, 200, "Login successful", {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    sendError(res, 401, error.message || "Login failed", error.message);
  }
};

export const getProfileController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      sendError(res, 401, "Unauthorized");
      return;
    }

    const user = await getUserProfileService(userId);

    if (!user) {
      sendError(res, 404, "User not found");
      return;
    }

    sendSuccess(res, 200, "Profile fetched successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    sendError(res, 500, error.message || "Failed to fetch profile");
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      sendError(res, 400, "Refresh token is required");
      return;
    }

    const tokens = await refreshTokenService(refreshToken);

    sendSuccess(res, 200, "Token refreshed successfully", tokens);
  } catch (error: any) {
    sendError(res, 401, error.message || "Failed to refresh token");
  }
};
