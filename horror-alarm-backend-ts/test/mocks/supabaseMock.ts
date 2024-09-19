export function mockSupabaseClient(mockData: any) {
  return {
    from: () => ({
      select: () => ({
        gte: (field: string, value: string) => ({
          data: mockData.filter((item: any) => new Date(item[field]) >= new Date(value)),
          error: null
        }),
        in: (field: string, values: string[]) => ({
          data: mockData.filter((item: any) => values.includes(item[field])),
          error: null
        })
      })
    })
  };
}

export function mockSupabaseClientForMovie(movieData: any, providerData: any, reviewData: any) {
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (field: string, value: string) => {
          if (table === 'movie') {
            return { data: movieData, error: null };
          } else if (table === 'movie_providers') {
            return { data: providerData, error: null };
          } else if (table === 'reviews') {
            return { data: reviewData, error: null };
          }
          return { data: null, error: new Error('Table not found') };
        }
      })
    })
  };
}
