import { PageHeader, Image } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/austintgriffith/scaffold-eth" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Pubg_hub"
        subTitle="merkle me some tokens bro"
        
        
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
