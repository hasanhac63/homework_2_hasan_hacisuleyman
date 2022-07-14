import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Pagination,
  Input,
  Icon,
  Dropdown,
  Label,
  Message
} from "semantic-ui-react";
import Fuse from "fuse.js";
import { CSVLink } from "react-csv";

export default ({ options }) => {
  const {
    data = [],
    headers,
    fields,
    itemsPerPage,
    pagination,
    search,
    sort,
    title,
    exportCSV,
    searchByFields
  } = options;
  const itemPerPageOptions = [
    { key: 1, text: "5", value: 5 },
    { key: 2, text: "10", value: 10 },
    { key: 3, text: "25", value: 25 },
    { key: 4, text: "50", value: 50 }
  ];
  const [itemPerPage, setItemPerPage] = useState(itemsPerPage || 10000);
  const [orderedData, setOrderedData] = useState([]);
  const [activePageData, setActivePageData] = useState([]);
  const [orderedBy, setOrderedBy] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const calculatePageCount = useCallback(function() {
    return data.length % itemPerPage === 0
      ? parseInt(data.length / itemPerPage, 10)
      : parseInt(data.length / itemPerPage, 10) + 1;
  }, [data.length, itemPerPage]);
  const [paginationOptions, setPaginationOptions] = useState({
    activePage: 1,
    boundaryRange: 1,
    siblingRange: 1,
    showEllipsis: true,
    showFirstAndLastNav: false,
    showPreviousAndNextNav: true,
    totalPages: calculatePageCount()
  });
  const sortByFieldAsc = (a, b, field) => (a[field] < b[field] ? -1 : 1);
  const sortByFieldDesc = (a, b, field) => (a[field] > b[field] ? -1 : 1);
  const sortByAsc = field => {
    setOrderedData(data.sort((a, b) => sortByFieldAsc(a, b, field)));
    setOrderedBy(`Sorted Asc by ${field}`);
    goToPage(1);
  };
  const sortByDesc = field => {
    setOrderedData(data.sort((a, b) => sortByFieldDesc(a, b, field)));
    setOrderedBy(`Sorted Desc by ${field}`);
    goToPage(1);
  };
  const goToPage = pageNumber => {
    setPaginationOptions({ ...paginationOptions, activePage: pageNumber });
    setActivePageData(
      orderedData.slice(
        (pageNumber - 1) * itemPerPage,
        pageNumber * itemPerPage
      )
    );
  };
  // const goTo = page => history.push(page);
  const searcher = new Fuse(data, {
    shouldSort: true,
    threshold: 0.2,
    location: 0,
    tokenize: true,
    matchAllTokens: true,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 4,
    keys: fields
  });
  const handleSearch = e => {
    const value = e.target.value;
    if (value !== "") {
      setIsSearching(true);
      const searchResult = searcher.search(value);
      setActivePageData(searchResult);
    } else {
      setIsSearching(false);
      setOrderedData(data);
      setPaginationOptions({
        ...paginationOptions,
        totalPages: calculatePageCount(),
        activePage: 1
      });
      goToPage(1);
    }
  };
  const handleSearchByField = (value, field) => {
    const searchResult = data.filter(item =>
      `${item[field]}`.toLowerCase().includes(`${value}`.toLowerCase())
    );
    setOrderedData(searchResult);
  };
  const handleSearchInputOnBlur = e => {
    e.target.value = "";
    setOrderedData(data);
  };
  const headersToExport = headers.map(header => {
    return {
      label: header.displayName,
      key: header.sortingFieldName
    };
  });
  useEffect(() => {
    setOrderedData(data);
    setPaginationOptions({
      ...paginationOptions,
      totalPages: calculatePageCount(),
      activePage: 1
    });
  }, [calculatePageCount, data, paginationOptions]);
  useEffect(() => {
    setActivePageData(orderedData.slice(0, itemPerPage));
  }, [itemPerPage, orderedData]);
  useEffect(() => {
    setPaginationOptions({
      ...paginationOptions,
      totalPages: calculatePageCount(),
      activePage: 1
    });
    setActivePageData(orderedData.slice(0, itemPerPage));
  }, [calculatePageCount, itemPerPage, orderedData, paginationOptions]);
  return (
    <Table selectable striped celled className="green-border-top">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan={fields.length}>
            {title && <Label ribbon>{title}</Label>}
            {search && (
              <Input
                style={{ float: "right", width: "260px" }}
                action={{ icon: "search" }}
                onChange={handleSearch}
                placeholder="arama..."
              />
            )}
            {exportCSV && (
              <CSVLink
                className="export-csv-button"
                filename={options.title || "yourmd-csv-export"}
                data={data}
                headers={headersToExport}
              >
                Export to CSV
              </CSVLink>
            )}
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Header>
        <Table.Row>
          {headers &&
            headers.map((header, index) => (
              <Table.HeaderCell key={index} style={{ verticalAlign: "bottom" }}>
                {header.displayName}
                {orderedBy !== `Sorted Asc by ${header.sortingFieldName}` &&
                  header.displayName !== "" &&
                  sort && (
                    <Icon
                      onClick={() => sortByAsc(header.sortingFieldName)}
                      style={{ color: "black !important" }}
                      name="arrow down"
                    />
                  )}
                {orderedBy !== `Sorted Desc by ${header.sortingFieldName}` &&
                  header.displayName !== "" &&
                  sort && (
                    <Icon
                      onClick={() => sortByDesc(header.sortingFieldName)}
                      style={{ color: "black !important" }}
                      name="arrow up"
                    />
                  )}
                <br />
                {searchByFields && (
                  <input
                    style={{ width: "100%" }}
                    placeholder={`${header.displayName}`}
                    onChange={e =>
                      handleSearchByField(
                        e.target.value,
                        header.sortingFieldName
                      )
                    }
                    onBlur={e => handleSearchInputOnBlur(e)}
                  />
                )}
              </Table.HeaderCell>
            ))}
        </Table.Row>
        <Table.Row />
      </Table.Header>
      <Table.Body>
        {activePageData &&
          activePageData.map((data, index) => (
            <Table.Row key={index}>
              {fields &&
                fields.map((field, index) => (
                  <Table.Cell key={index}>
                    {typeof field === "object" && field.render ? (
                      <field.render row={data} />
                    ) : (
                      <span>{data[field]}</span>
                    )}
                  </Table.Cell>
                ))}
            </Table.Row>
          ))}
        {data && data.length === 0 && (
          <Table.Row>
            <Table.Cell colSpan={fields.length}>
              <Message> There is no data to display </Message>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
      <Table.Footer>
        {!isSearching && pagination && (
          <Table.Row>
            <Table.HeaderCell colSpan={fields.length}>
              <span style={{ float: "right" }}>
                Göster{" "}
                <Dropdown
                  inline
                  onChange={(e, { value }) => {
                    setItemPerPage(value);
                  }}
                  options={itemPerPageOptions}
                  defaultValue={itemsPerPage}
                />{" "}
                items per page
              </span>
              <Pagination
                activePage={paginationOptions.activePage}
                boundaryRange={paginationOptions.boundaryRange}
                onPageChange={(_, { activePage }) => goToPage(activePage)}
                siblingRange={paginationOptions.siblingRange}
                totalPages={paginationOptions.totalPages}
                ellipsisItem={paginationOptions.showEllipsis ? undefined : null}
                firstItem={
                  paginationOptions.showFirstAndLastNav ? undefined : null
                }
                lastItem={
                  paginationOptions.showFirstAndLastNav ? undefined : null
                }
                prevItem={
                  paginationOptions.showPreviousAndNextNav ? undefined : null
                }
                nextItem={
                  paginationOptions.showPreviousAndNextNav ? undefined : null
                }
              />
            </Table.HeaderCell>
          </Table.Row>
        )}
        {isSearching && (
          <Table.Row>
            <Table.HeaderCell colSpan={fields.length}>
              <span style={{ float: "right" }}>{`${
                activePageData.length
              } item(s) found`}</span>
            </Table.HeaderCell>
          </Table.Row>
        )}
      </Table.Footer>
    </Table>
  );
};
