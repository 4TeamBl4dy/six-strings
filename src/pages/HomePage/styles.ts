import { styled } from '@mui/material/styles';
import { Box, Container, Typography, Button, Card, CardMedia, CardContent, Grid } from '@mui/material';

export const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const SliderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(8),
}));

export const SliderTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  textAlign: 'center',
  marginBottom: theme.spacing(2),
}));

export const SliderWrapper = styled(Box) ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const SliderButton = styled(Button)(({ theme }) => ({
  fontSize: '2rem',
  minWidth: '40px',
  color: theme.palette.text.primary,
}));

export const CarouselContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'cardCount',
})<{ cardCount: number }>(({ cardCount }) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${cardCount}, 200px)`,
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  gap: '16px',
  paddingTop: '16px',
  paddingBottom: '16px',
  width: '100%',
}));

export const PaginationWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(2),
}));

export const PaginationButton = styled(Button)(({ theme }) => ({
  minWidth: '25px',
  height: '8px',
  backgroundColor: theme.palette.grey[300],
  margin: theme.spacing(0.5),
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: theme.palette.grey[400],
  },
}));

export const ActivePaginationButton = styled(PaginationButton) ({
  backgroundColor: '#FF6428',
  '&:hover': {
    backgroundColor: '#FF6428',
  },
})

export const CategorySection = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(8),
  justifyContent: 'center',
}));

export const CategoryCard = styled(Card)(({ theme }) => ({
  height: '280px',
  borderRadius: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  color: theme.palette.common.white,
  textAlign: 'center',
  padding: theme.spacing(2),
}));

export const CategoryGridItem = styled(Grid)({
  minWidth: '170px',
})

export const BrandsSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(8),
}));

export const BrandsTitle = styled(Typography) ({
  fontWeight: 600,
  display: 'inline',
})

export const BrandsImage = styled('img')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(8),
}));

export const FooterSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  color: theme.palette.common.white,
  borderRadius: theme.spacing(2),
  marginLeft: theme.spacing(0.5),
  marginRight: theme.spacing(0.5),
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
}));

export const FooterTitleWrapper = styled(Box)({
  textAlign: 'center',
});

export const FooterGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(4),
  justifyContent: 'center',
}));

export const FooterItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

export const FooterImage = styled('img')({
  width: '80px',
  height: '80px',
  marginBottom: '16px',
});

export const FooterSubtitle = styled(Typography) ({
  fontWeight: 600,
  textTransform: 'uppercase',
})

export const FooterDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.grey[500],
  maxWidth: '225px',
  marginLeft: 'auto',
  marginRight: 'auto',
}));