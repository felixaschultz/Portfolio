import React, { useEffect, useState } from "react";

const useDocTitle = title => {
  const [doctitle, setDocTitle] = React.useState(title);

  React.useEffect(() => {
    document.title = doctitle;
  }, [doctitle]);

  return [doctitle, setDocTitle];
};

export {useDocTitle};