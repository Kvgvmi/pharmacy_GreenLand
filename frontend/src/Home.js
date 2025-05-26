import React from "react";
import Header from "./Components/Header/Header";
import NavBar from "./Components/NavBar/NavBar";
import Content from "./Components/Content/Content";
import Footer from "./Components/Footer/Footer";


function Home() {
  return (
    <div>
      <Header />
      <NavBar />
      <Content />
      
      <Footer />
    </div>
  );
}

export default Home;
