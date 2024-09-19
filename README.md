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
 

### 이 API 서버가 제공하는 요청에 대한 설명

스푸키 타운(이하 스푸키)의 백엔드 API 요청의 응답 값을 정리했습니다. 스푸키 백엔드는 다음 요청 URL에 응답합니다:

1. GET("/api/releasing")
   상영 중인 영화 정보를 반환합니다.
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
   상영 예정 영화 정보를 반환합니다. 응답 형식은 "/api/releasing"과 동일합니다.

3. GET("/api/streaming/expired")
   스트리밍 종료 예정인 영화의 정보를 반환합니다.
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
   스트리밍 종료 예정 영화의 상세 정보를 반환합니다.
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
   스트리밍 서비스의 총 페이지 수를 반환합니다.
   ```json
   숫자
   ```

6. GET("/api/streaming/page")
   스트리밍 서비스의 특정 페이지 영화 정보를 반환합니다.
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
   영화의 상세 정보를 반환합니다. 카테고리에 따라 응답이 다릅니다.
   - 스트리밍 카테고리: "/api/streaming/expired/detail/{id}"와 동일한 응답
   - 그 외 카테고리: "/api/releasing"의 단일 영화 응답과 동일