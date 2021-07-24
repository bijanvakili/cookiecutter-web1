import * as React from "react";

interface Props {
  description: string;
}

const App: React.FC<Props> = (props: Props) => {
  return (
    <>
      <div className="container">
        <div className="row">
          <h1 className="display-1 sample-title">{props.description}</h1>
        </div>
      </div>
    </>
  );
};

export default App;
