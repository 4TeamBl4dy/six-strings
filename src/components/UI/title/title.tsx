import React from 'react'
import { StyledTitle, StyledSubtitle, TitleContainer } from './styles'

interface TitleProps {
  text: string | null;
  subText?: string;
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  sx?: React.CSSProperties;
  subTitleSx?: React.CSSProperties;
}

export const Title: React.FC<TitleProps> = ({ text, subText, size = 'h3', sx, subTitleSx }) => {
  return text ? (
    <TitleContainer sx={sx}>
      {subText ? (
        <>
          <StyledTitle size={size}>{text}</StyledTitle>
          <StyledSubtitle sx={subTitleSx} size={size}>
            {subText}
          </StyledSubtitle>
        </>
      ) : (
        <StyledTitle size={size}>{text}</StyledTitle>
      )}
    </TitleContainer>
  ) : null
}