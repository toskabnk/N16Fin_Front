import React from "react";

class BuggyComponent extends React.Component {
    componentDidMount() {
      throw new Error("¡Oh no, algo salió mal!");
    }
  
    render() {
      return <div>Este componente tiene un bug.</div>;
    }
}

export default BuggyComponent;