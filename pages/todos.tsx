import {
  Button,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Header from "../Components/Header";
import {
  ItodoListState,
  editTargetState,
  todoListState,
} from "../Components/store/Atom";
import NextLink from "next/link";
import MuiLink from "@mui/material/Link";
import { useRouter } from "next/router";
import {
  CollectionReference,
  FieldValue,
  QuerySnapshot,
  collection,
  doc,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";

const sortTasksId = (
  arr: {
    id: number;
    title: string;
    detail: string;
    uuid: string;
    createdAt: FieldValue;
    updateAt: FieldValue;
    status: any;
  }[],
  sortBy: "id",
  order: "asc" | "desc"
) =>
  arr.sort(
    (
      a: { id: number; title: string; detail: string; status: any },
      b: { id: number; title: string; detail: string; status: any }
    ) => (order === "asc" ? a[sortBy] - b[sortBy] : b[sortBy] - a[sortBy])
  );

const TodosPage = () => {
  const todoList = useRecoilValue(todoListState);
  const router = useRouter();

  //ソート用
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<"id" | "status">("id");

  //フィルター用
  const [filter, setFilter] = useState(
    "全て表示" || "未完了" || "途中" || "完了"
  );
  const [filterTodos, setFilterTodos] = useState(todoList);

  //編集用
  const [editTarget, setEditTarget] = useRecoilState(editTargetState);

  //ソート
  const handleSort = (sortBy: "id" | "status") => (e: React.MouseEvent) => {
    const newOrder: "asc" | "desc" =
      orderBy === sortBy ? (order === "asc" ? "desc" : "asc") : "asc";
    setOrderBy(sortBy);
    setOrder(newOrder);
    if (sortBy === "id")
      setFilterTodos(sortTasksId(todoList.concat(), sortBy, newOrder));
  };

  //フィルター
  const filterHandler = async (filter: string) => {
    const targetTodos = todoList.filter((todo) => todo.status === filter);
    if (filter === "全て表示") {
      setFilterTodos(todoList);
    } else {
      setFilterTodos(targetTodos);
    }
  };

  //データ取得
  useEffect(() => {
    const todoData = collection(
      db,
      "todos"
    ) as CollectionReference<ItodoListState>;
    onSnapshot(todoData, (todo) => {
      setFilterTodos(todo.docs.map((doc) => ({ ...doc.data() })));
    });
  }, []);

  const editHandler = async (id: number, uuid: string) => {
    await setEditTarget({
      id: id,
      uuid: uuid,
    });
    router.push({
      pathname: `/todos/${encodeURIComponent(id)}/edit`,
    });
  };

  return (
    <>
      <Header />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "id"}
                  direction={order === "asc" ? "desc" : "asc"}
                  onClick={handleSort("id")}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>タイトル</TableCell>
              <TableCell>内容</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={order === "asc" ? "desc" : "asc"}
                  onClick={handleSort("status")}
                >
                  ステータス
                </TableSortLabel>
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filterTodos.map((todo) => (
              <TableRow key={todo.id}>
                <TableCell>{todo.id}</TableCell>
                <TableCell>{todo.title}</TableCell>
                <TableCell>{todo.detail}</TableCell>
                <TableCell>{todo.status}</TableCell>
                <TableCell>
                  {todo.id !== 0 ? (
                    <MuiLink>
                      <NextLink href={`/todos/${encodeURIComponent(todo.id)}`}>
                        <Button>詳細</Button>
                      </NextLink>
                    </MuiLink>
                  ) : (
                    <Button>詳細</Button>
                  )}
                </TableCell>
                <TableCell>
                  {todo.id !== 0 ? (
                    <Button onClick={(e) => editHandler(todo.id, todo.uuid)}>
                      編集
                    </Button>
                  ) : (
                    <Button>編集</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Box margin="10px">
          <NextLink href="/todos/create">
            <MuiLink underline="none" marginTop="10px" marginRight="10px">
              <Button variant="contained">
                <Box>新規Todo作成</Box>
              </Button>
            </MuiLink>
          </NextLink>
          <Select
            multiline
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              filterHandler(e.target.value);
            }}
          >
            <MenuItem value={"全て表示"}>全て表示</MenuItem>
            <MenuItem value={"未完了"}>未完了</MenuItem>
            <MenuItem value={"途中"}>途中</MenuItem>
            <MenuItem value={"完了"}>完了</MenuItem>
          </Select>
        </Box>
      </TableContainer>
    </>
  );
};

export default TodosPage;
