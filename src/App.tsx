import React from "react";
import "./App.css";
import Form from "./components/Form";
import Header from "./components/header/Header";

function App() {
    return (
        <div className="App">
            <Header />
            <div className="content">
                <Form />
            </div>
        </div>
    );
}

export default App;
