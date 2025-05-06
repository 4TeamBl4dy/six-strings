import { styled } from '@mui/system'
import TextField from "@mui/material/TextField";
import {theme} from "../../theme";

export const DataField = styled(TextField)({
  '& .MuiInputLabel-root': {
    fontSize: '14px',
    color: 'grey'
  },
  '& .MuiInputBase-input': {
  color: 'black !important',
    padding: '12px',
    fontSize: '14px',
  },
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '16px',
    width: '100%',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 0
  }
})

