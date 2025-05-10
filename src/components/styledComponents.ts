import { styled } from "@mui/system";
import { theme } from "src/theme";
import Checkbox from "@mui/material/Checkbox";

export const StyledCheckbox = styled(Checkbox)({
    "& .MuiSvgIcon-root": {
      backgroundColor: theme.palette.secondary.main,
      borderRadius: "8px",
      fill: "transparent",
      stroke: "transparent",
    },
    "&.Mui-checked": {
      color: theme.palette.primary.main,
      borderRadius: "8px",
      "& .MuiSvgIcon-root": {
        backgroundColor: "transparent",
        fill: theme.palette.primary.main,
        stroke: theme.palette.primary.main,
        borderRadius: "8px",
      },
    },
    "&:hover": {
      backgroundColor: "transparent",
    },
  });