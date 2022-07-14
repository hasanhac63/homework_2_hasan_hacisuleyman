import React from "react";
import ReactDOM from "react-dom";
import SemanticTable from "./App";
import "semantic-ui-css/semantic.min.css";

const options = {
  data: [
    { branch: "master" },
    { branch: "staging" },
    { branch: "develop" },
    { branch: "feature" },
    { branch: "master1" },
    { branch: "staging1" },
    { branch: "develop1" },
    { branch: "feature1" },
    { branch: "master2" },
    { branch: "staging2" },
    { branch: "develop2" },
    { branch: "feature2" }
  ],
  headers: [
    {
      displayName: "Branch",
      sortingFieldName: "branch"
    }
  ],
  fields: ["branch"],
  title: "Data Branches",
  searchByFields: true,
  exportCSV: true,
  sort: true,
  pagination: true,
  itemsPerPage: 5,
  search: true
};
ReactDOM.render(
  <SemanticTable options={options} />,
  document.getElementById("root")
);
