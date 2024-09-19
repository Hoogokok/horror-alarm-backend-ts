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
