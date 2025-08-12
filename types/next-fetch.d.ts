interface NextFetchRequestInit extends RequestInit {
    next?: {
      revalidate?: number | false;
    };
  }
  
  declare function fetch(
    input: RequestInfo,
    init?: NextFetchRequestInit
  ): Promise<Response>;
  