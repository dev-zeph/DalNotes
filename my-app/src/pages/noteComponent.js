import React from "react";

const NoteComponent = () => {
  return (
    <div className="note">
      <h2>Title</h2>
      <p>Course: Math</p>
      <p>Author: John Doe</p>
      <p>Date: 2022-01-01</p>
      <button>Delete</button>
    </div>
  );
};

export default NoteComponent;
