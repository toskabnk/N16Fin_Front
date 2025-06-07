import styled from "styled-components";

export const StyledFlexFullCenter = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: ${props => (props.height ? props.height : '100vh')};;
  background-color: ${props => props.theme.palette.background.default};
`

export const StyledFullCenter = styled('div')`
  width: 100%;
  height: ${props => (props.height ? props.height : '100vh')};;
  background-color: ${props => props.theme.palette.background.default};
`

export const StyledFlexFull = styled('div')`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  height: ${props => (props.height ? props.height : '100vh')};
  background-color: ${props => props.theme.palette.background.default};
`
export const StyledFlexFullRow = styled('div')`
  display: flex;
  flex-direction: row;
  width: 100%;
  flex-grow : 1;
  height: ${props => (props.height ? props.height : '100vh')};
  background-color: ${props => props.theme.palette.background.default};
`

export const StyledFlexCenter = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
`

export const Center = styled('div')`
   position: absolute;
   top: 50%;
   left: 50%;
  transform: translate(-50%, -50%);
 `