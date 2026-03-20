package pb

import "github.com/go-resty/resty/v2"

func NewClient(baseURL string) *resty.Client {
	return resty.New().
		SetBaseURL(baseURL)
}