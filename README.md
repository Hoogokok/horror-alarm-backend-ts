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
 

### 이 API 서버가 제공해야하는 요청에 대한 설명

스푸키 타운(이하 스푸키)의 백엔드 API 요청의 응답 값을 정리하기 위해 작성됐다.  스푸키 백엔드는 다음 네 가지 요청 url에 응답해야 한다. 
1. Get("/api/upcoming")
2. Get("/api/releasing")
3. Get("/api/streaming/expired")
4. Get("/api/streaming/expired/detail/{id}")

각 URL의 응답은 자세하게 다음을 반환해야 한다.

## 1.   Get("/api/upcoming")

상영 예정 영화 정보를 반환한다.

```
title: 영화 제목(문자열)
releaseDate: 개봉날짜(문자열 형식: yyyy-mm-dd)
posterPath: 영화 포스터 uri
overView: 영화에 대한 짧은 설명(문자열)
theaters: 상영관 정보(형식은 배열)
```


## 2.  Get("/api/releasing")

상영 중인 영화 정보를 반환한다. 데이터 형식은 상영 예정 영화 정보와 동일하다.

```
title: 영화 제목(문자열)
releaseDate: 개봉날짜(문자열 형식: yyyy-mm-dd)
posterPath: 영화 포스터 uri
overView: 영화에 대한 짧은 설명(문자열)
theaters: 상영관 정보(형식은 배열)
```


## 3. Get("/api/streaming/expired")
 스트리밍 종료 예정인 영화의 정보를 반환한다.
 
```
id: 영화 아이디(long)
title: 영화 제목(문자열)
posterPath: 영화 포스터 uri
expiredDate: 스트리밍 종료일
```



## 4. Get("/api/streaming/expired/detail/{id}")
파라미터 값으로 id를 반환하면 스트리밍 종료 예정 영화의 상세 정보를 반환한다.
```
title: 영화 제목(문자열)
posterPath: 영화 포스터 uri
overView: 영화에 대한 짧은 설명(문자열)
```

