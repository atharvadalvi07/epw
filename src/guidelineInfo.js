import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const guidelineInfo = {
  ISHRAE_A: (   
    <>
      <Link href="https://shop.ishrae.in/product/details/indoor-environmental-quality-standard-ishrae-standard-/65" 
        target="https://shop.ishrae.in/product/details/indoor-environmental-quality-standard-ishrae-standard-/65" rel="noopener noreferrer">
        ISHRAE Class A guideline information... 
      </Link>
    </>
 ),
  
  ISHRAE_B: (   
    <>
      <Link href="https://shop.ishrae.in/product/details/indoor-environmental-quality-standard-ishrae-standard-/65" 
        target="https://shop.ishrae.in/product/details/indoor-environmental-quality-standard-ishrae-standard-/65" rel="noopener noreferrer">
        ISHRAE Class B guideline information... 
      </Link>
    </>
 ),

  ISHRAE_C: (   
    <>
      <Link href="https://shop.ishrae.in/product/details/indoor-environmental-quality-standard-ishrae-standard-/65" 
        target="https://shop.ishrae.in/product/details/indoor-environmental-quality-standard-ishrae-standard-/65" rel="noopener noreferrer">
        ISHRAE Class C guideline information... 
      </Link>
    </>
 ),

  LEED_min: (   
    <>
      <Link href="https://www.usgbc.org/resources/leed-v5-public-comment-draft-operations-and-maintenance-existing-buildings" 
        target="https://www.usgbc.org/resources/leed-v5-public-comment-draft-operations-and-maintenance-existing-buildings" rel="noopener noreferrer">
        LEED (min) guideline information... 
      </Link>
    </>
 ),

  LEED_EN:(   
    <>
      <Link href="https://www.usgbc.org/resources/leed-v5-public-comment-draft-operations-and-maintenance-existing-buildings" 
        target="https://www.usgbc.org/resources/leed-v5-public-comment-draft-operations-and-maintenance-existing-buildings" rel="noopener noreferrer">
        LEED (enhanced) guideline information...
      </Link>
    </>
 ),

  RESET_min:(   
    <>
      <Link href="https://reset.build/standard/air" 
        target="https://reset.build/standard/air" rel="noopener noreferrer">
        RESET (min) guideline information...
      </Link>
    </>
 ),

  RESET_hp:(   
    <>
      <Link href="https://reset.build/standard/air" 
        target="https://reset.build/standard/air" rel="noopener noreferrer">
        RESET (high performance) guideline information...
      </Link>
    </>
 ), 

  IGBC:(   
    <>
      <Link href="https://igbc.in/igbc-green-new-buildings.php" 
        target="https://igbc.in/igbc-green-new-buildings.php" rel="noopener noreferrer">
        IGBC guideline information...
      </Link>
    </>
 ),  

//   GRIHA: "GRIHA guideline information...",
//   WHO: "WHO guideline information...",
  ASHRAE:(   
    <>
      <Link href="https://www.ashrae.org/technical-resources/bookstore/indoor-air-quality-guide" 
        target="https://www.ashrae.org/technical-resources/bookstore/indoor-air-quality-guide" rel="noopener noreferrer">
        ASHRAE guideline information...
      </Link>
    </>
 ),  
 
//   US_EPA: "US EPA guideline information...",

  NBC_INDIA:(   
    <>
      <Link href="https://www.bis.gov.in/standards/technical-department/national-building-code/" 
        target="https://www.bis.gov.in/standards/technical-department/national-building-code/" rel="noopener noreferrer">
        NBC INDIA guideline information...
      </Link>
    </>
 ),   

  WELL:(   
    <>
      <Link href="https://standard.wellcertified.com/air" 
        target="https://standard.wellcertified.com/air" rel="noopener noreferrer">
        WELL guideline information...
      </Link>
    </>
 ),    
};

const GuidelineInfo = ({ selectedGuideline }) => {
  return (
    <Box p={2} bgcolor="white" boxShadow={0} borderRadius={1}>
      <Typography variant="body1">
        <p style={{color: '#000000' ,font: 5}}> {guidelineInfo[selectedGuideline]} </p>
        <p style={{color: '#000000' ,font: 2}}>For more info about the guidelines please contact research@respirer.in</p>
      </Typography>
    </Box>
  );
};

export default GuidelineInfo;
