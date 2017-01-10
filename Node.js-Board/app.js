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
      var date = boards[0].board_date;
      for(var i=0; i < boards.length ; i++){
        boards[i].board_date = date.toLocaleString();
      }

      //list에 필요한 객체및 변수 전달
      res.render('list', {boards:boards,currentPage:currentPage,lastPage:lastPage});
  });
});

//포트 리스닝
app.listen(3000, function(){
  console.log('Connected, 3000 port!');
});
