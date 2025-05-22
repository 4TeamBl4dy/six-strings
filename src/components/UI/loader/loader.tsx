import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { theme } from "src/theme";

interface LoaderProps {
  text?: string;
  fullHeight?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ text = "Загрузка...", fullHeight = false }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: fullHeight ? "100%" : "auto",
        minHeight: fullHeight ? "300px" : "auto",
        py: 4,
        width: "100%",
      }}
    >
      <CircularProgress color="primary" sx={{ color: theme.palette.primary.main }} />
      <Typography mt={2} color="text.secondary" fontSize={'12px'}>
        {text}
      </Typography>
    </Box>
  );
};