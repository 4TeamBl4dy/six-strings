import { Typography } from "@mui/material";
import { styled } from "@mui/system";

interface TitleStylesProps {
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const getFontSize = (
  size: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | undefined,
) => {
  switch (size) {
    case "h1":
      return "28px";
    case "h2":
      return "24px";
    case "h3":
      return "20px";
    case "h4":
      return "18px";
    case "h5":
      return "16px";
    case "h6":
      return "14px";
    default:
      return "28px";
  }
};

const getLineHeight = (
  size: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | undefined,
) => {
  switch (size) {
    case "h1":
      return "36px";
    case "h2":
      return "32px";
    case "h3":
      return "28px";
    case "h4":
      return "28px";
    case "h5":
      return "22px";
    case "h6":
      return "18px";
    default:
      return "28px";
  }
};

export const StyledTitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "size",
})<TitleStylesProps>(({ size, theme }) => ({
  fontSize: getFontSize(size),
  fontWeight: 700,
  lineHeight: getLineHeight(size),
  letterSpacing: "0px",
  textAlign: "left",
  textTransform: "none",
}));

export const StyledSubtitle = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "size",
})<TitleStylesProps>(({ size, theme }) => ({
  padding: "0px 8px 0px 0px",
  lineHeight: size ? `calc(${getLineHeight(size)} - 8px)` : undefined,
  letterSpacing: "1px",
  textAlign: "left",
  textTransform: "none",
  fontSize: size ? `calc(${getFontSize(size)} - 8px)` : undefined,
}));

export const TitleContainer = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  marginRight: "20px",
}));