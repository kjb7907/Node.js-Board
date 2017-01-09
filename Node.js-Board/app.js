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
app.use(express.static('public')); //uploads 폴더 매핑(정적파일위치지정)
app.set('views', './views_board'); //템플릿엔진이 있는 디렉터리 명시
app.set('view engine', 'jade'); //템플릿엔진 세팅 express 연결

//글목록
app.get('/board/list', function(req, res){
  var currentPage = 1; //현재페이지 할당
  var pagePerRow = 10; //가져올 게시물 수 할당
  var totalRowCount = 0; //전체게시물 변수 할당
  //넘어오는 페이지수가 있다면 현재페이지에 대입
  if(req.query.currentPage){
    currentPage = req.query.currentPage;
  }

  //전체 게시물 수 가져오기
  var countSql = "SELECT COUNT(*) FROM board";
  conn.query(countSql,function(err,count,fields){
    console.log(count); //테스트1
    console.log(count[0]); //테스트 2
  //  console.log(count[0].count(*)); //테스트3
    totalRowCount = count[0];
    console.log(totalRowCount+" : 전체게시글 수");
  });

  //글번호 & 글제목 가져오기
  var sql = 'SELECT board_no,board_title,board_user,board_date FROM board';
  conn.query(sql, function(err, boards, fields){ //쿼리문실행&쿼리문실행후 실행되는 콜백함수
      console.log(boards[0].board_date); //테스트 1
      console.log(boards[0].board_date+" : boards[0].board_date"); //테스트 2
      res.render('list', {boards:boards}); //전체글만 전달하며 view페이지 렌더링
  });
});

//포트 리스닝
app.listen(3000, function(){
  console.log('Connected, 3000 port!');
});
