import jwt from "jsonwebtoken";

export const Auth = async (req, res, next) => {
  try {
    const token = req.get("authorization");
    if (!token) res.status(401).send("No Token Found");

    const jwtSecret = req.originalUrl.includes("refresh")
      ? process.env.JWT_REFRESH_SECRET
      : process.env.JWT_SECRET;
    jwt.verify(token.split(" ")[1], jwtSecret, (err, user) => {
      if (err && err.message === "TokenExpiredError")
        return res.status(403).send("Token Expired");
      if (err) return res.status(401).send("Invalid Token");

      req.user = user;
      next();
    });
  } catch (err) {
    return res.status(401).send("Unauthorized User");
  }
};