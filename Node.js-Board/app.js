var express = require('express'); //익스프레스 로드
var bodyParser = require('body-Parser'); //body-Parser 미들웨어 로드(post방식데이터 받기)

var mysql = require('mysql'); //mysql 로드(db접근)
//db접속정보
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'java0000',
  database : 'injava'
});
conn.connect(); //db연결

var app = express();
app.use(bodyParser.urlencoded({ extended: false })); //body-Parser모듈 애플리케이션에 붙이는코드
app.locals.pretty = true; //템플릿 엔진 코드 들여쓰기 적용
app.use('/board',express.static('public')); //uploads 폴더 매핑(정적파일위치지정)
app.set('views', './views_board'); //템플릿엔진이 있는 디렉터리 명시
app.set('view engine', 'jade'); //템플릿엔진 세팅 express 연결


//글입력 폼
app.get('/board/add',function(req,res){
  console.log('add form');
  res.render('add');
});

//글입력 처리
app.post('/board/add',function(req,res){
  console.log('add process');
  //넘어온 값 받기
  var boardTitle = req.body.boardTitle;
  var boardContent = req.body.boardContent;
  var boardUser = req.body.boardUser;
  var boardPw = req.body.boardPw;

  //insert 작업
  var sql = 'INSERT INTO board (board_title, board_content,board_User, board_pw,board_date) VALUES(?, ?, ?, ?, now())';
  conn.query(sql, [boardTitle, boardContent,boardUser, boardPw], function(err, result, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/board/view?boardNo='+result.insertId);
    }
  });
});

//글 상세페이지
app.get('/board/view',function(req,res){ //시맨틱url적용
  console.log('view');
  var boardNo = req.query.boardNo;
  console.log('boardNo : '+boardNo);
  if(boardNo){ //boardNo가 넘어왔다면
    var selectSql = 'SELECT * FROM board WHERE board_no =?';

    conn.query(selectSql,[boardNo],function(err,board,fields){

      //날짜 형식 변경
        var date = board[0].board_date;
        board[0].board_date = date.toLocaleString();

        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('view',{board:board[0]});
        }
    });
  }
});

//글목록
app.get('/board/list', function(req, res){
  console.log('list');
  var currentPage = 1; //현재페이지 할당
  var pagePerRow = 10; //가져올 게시물 수 할당
  var totalRowCount; //전체게시물 변수 할당
  var lastPage; //마지막페이지 변수 할당

  //넘어오는 페이지수가 있다면 현재페이지에 대입
  if(req.query.currentPage){
    console.log(req.query.currentPage+" 넘어온 currentPage");
    currentPage = req.query.currentPage;

  }


  //전체 게시물 수 가져오기
  var countSql = "SELECT COUNT(*) FROM board";
  conn.query(countSql,function(err,count,fields){

    //컬럼명인 COUNT(*)가 특수문자가포함되어 함수로인식되기 때문에 []참조연산 사용
    totalRowCount = count[0]['COUNT(*)'];

     lastPage = totalRowCount/pagePerRow; //마지막페이지 = 전체글수/한페이지당게시글수
    if(totalRowCount%pagePerRow !== 0){ //10으로 나누어 떨어지지않는경우 1 추가
      lastPage++;
      console.log(lastPage+" if.lastPage");
    }
  });
  var beginRow = (currentPage-1)*pagePerRow; //가져올 첫번째 글

  console.log(beginRow + " beginRow");

  //글번호 & 글제목 가져오기
  var sql = 'SELECT board_no,board_title,board_user,+board_date FROM board ORDER BY board_no DESC LIMIT ?, ?';
  conn.query(sql,[beginRow,pagePerRow],function(err, boards, fields){ //쿼리문실행&쿼리문실행후 실행되는 콜백함수

      //자바스크립트 date 객체의 toLocaleString() 타입으로 날짜 출력을위해 배열안의 원소 수정
      for(var i=0; i < boards.length ; i++){
        var date = boards[i].board_date;
        boards[i].board_date = date.toLocaleString();
      }

      //list에 필요한 객체및 변수 전달
      res.render('list', {boards:boards,currentPage:currentPage,lastPage:lastPage});
  });
});

//글수정 폼
app.get('/board/modify',function(req,res){
  console.log('modify form');
  var boardNo = req.query.boardNo;
  if(boardNo){
    var sql = 'SELECT * FROM board WHERE board_no=?';
    conn.query(sql, [boardNo], function(err, board, fields){
      if(err){
        console.log(err);
        res.status(500).send('Internal Server Error');
      } else {
        res.render('modify', {board:board[0]});
      }
    });
  } else {
    console.log('There is no id.');
    res.status(500).send('Internal Server Error');
  }
});

//글 수정 처리
app.post('/board/modify',function(req,res){
  console.log('modify process');

  var boardTitle = req.body.boardTitle;
  var boardContent = req.body.boardContent;
  var boardUser = req.body.boardUser;
  var boardPw = req.body.boardPw;
  var boardNo = req.body.boardNo;

  var sql = 'UPDATE board SET board_title=?, board_content=?, board_User=? WHERE board_no=?&&board_pw=?';
  conn.query(sql, [boardTitle, boardContent, boardUser, boardNo,boardPw], function(err, result, fields){
    console.log(result);

    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
        if(result.changedRows==0){  //수정성공여부판단
          res.redirect('/board/modify?boardNo='+boardNo);  //실패시 수정화면
        } else {
          res.redirect('/board/view?boardNo='+boardNo); //성공시뷰페이지
        }
    }
  });
});

//글 삭제비밀번호입력 폼
app.get('/board/remove',function(req,res){
  console.log('remove form');
  var boardNo = req.query.boardNo;
  if(boardNo){
        res.render('remove', {boardNo:boardNo});
  } else {
    console.log('There is no id.');
    res.status(500).send('Internal Server Error');
  }
});

//글삭제 처리
app.post('/board/remove',function(req,res){
  console.log('remove process');
  var boardPw = req.body.boardPw;
  var boardNo = req.body.boardNo;

  var sql = 'DELETE FROM board WHERE board_no=?&&board_pw=?';
  conn.query(sql, [boardNo,boardPw], function(err, result, fields){
    console.log(result);

    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    } else {
        if(result.affectedRows==0){  //삭제성공여부판단
          res.redirect('/board/remove?boardNo='+boardNo);  //실패시 삭제화면
        } else {
          res.redirect('/board/list'); //성공시리스트
        }
    }
  });
});

//포트 리스닝
app.listen(3000, function(){
  console.log('Connected, 3000 port!');
});
