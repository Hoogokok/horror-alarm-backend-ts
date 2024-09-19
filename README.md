### 기술 스택
```
언어: TypeScript
런타임: Deno
웹 프레임워크: Hono 
데이터베이스: PostgreSQL
데이터베이스 ORM: Supabase
```

### 프로젝트 설명 
이 프로젝트는 기존의 자바, 스프링로 작성된 스푸키 백엔드를 TypeScript로 다시 작성한 프로젝트이다. 
 

### 스푸키 타운 백엔드 API 문서

스푸키 타운의 백엔드 API는 다음 엔드포인트를 제공합니다:

1. GET("/api/releasing")
   - 설명: 현재 상영 중인 영화 정보를 반환합니다.
   - 필요한 매개변수: 없음
   - 응답:
     ```json
     [
       {
         "id": "문자열",
         "title": "문자열",
         "release_date": "YYYY-MM-DD",
         "poster_path": "문자열",
         "overview": "문자열",
         "providers": ["문자열"],
         "the_movie_db_id": "문자열",
         "reviews": ["문자열"]
       }
     ]
     ```

2. GET("/api/upcoming")
   - 설명: 상영 예정인 영화 정보를 반환합니다.
   - 필요한 매개변수: 없음
   - 응답: "/api/releasing"과 동일한 형식

3. GET("/api/streaming/expired")
   - 설명: 스트리밍 서비스에서 곧 종료될 영화 목록을 반환합니다.
   - 필요한 매개변수: 없음
   - 응답:
     ```json
     {
       "expiredMovies": [
         {
           "id": "문자열",
           "title": "문자열",
           "poster_path": "문자열",
           "expired_date": "YYYY-MM-DD"
         }
       ]
     }
     ```

4. GET("/api/streaming/expired/detail/{id}")
   - 설명: 특정 스트리밍 종료 예정 영화의 상세 정보를 반환합니다.
   - 필요한 매개변수: 
     - id: 영화 ID (URL 경로에 포함)
   - 응답:
     ```json
     {
       "id": "문자열",
       "title": "문자열",
       "poster_path": "문자열",
       "overview": "문자열",
       "release_date": "YYYY-MM-DD",
       "vote_average": 숫자,
       "vote_count": 숫자,
       "the_movie_db_id": "문자열",
       "providers": ["문자열"],
       "reviews": ["문자열"]
     }
     ```

5. GET("/api/streaming")
   - 설명: 스트리밍 서비스의 총 페이지 수를 반환합니다.
   - 필요한 매개변수:
     - query: 스트리밍 서비스 이름 (예: "netflix", "disney")
   - 응답: 
     ```json
     숫자
     ```

6. GET("/api/streaming/page")
   - 설명: 스트리밍 서비스의 특정 페이지 영화 정보를 반환합니다.
   - 필요한 매개변수:
     - query: 스트리밍 서비스 이름 (예: "netflix", "disney")
     - page: 페이지 번호
   - 응답:
     ```json
     [
       {
         "id": "문자열",
         "title": "문자열",
         "poster_path": "문자열",
         "overview": "문자열",
         "release_date": "YYYY-MM-DD",
         "vote_average": 숫자,
         "vote_count": 숫자,
         "the_movie_db_id": "문자열",
         "providers": ["문자열"]
       }
     ]
     ```

7. GET("/api/movie/{id}")
   - 설명: 영화의 상세 정보를 반환합니다.
   - 필요한 매개변수:
     - id: 영화 ID (URL 경로에 포함)
     - category: 영화 카테고리 (쿼리 매개변수, 예: "streaming")
   - 응답:
     - category가 "streaming"인 경우: "/api/streaming/expired/detail/{id}"와 동일
     - 그 외의 경우: "/api/releasing"의 단일 영화 응답과 동일