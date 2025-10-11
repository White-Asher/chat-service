```
k6-1  |   █ THRESHOLDS                                                                                                                                               
k6-1  | 
k6-1  |     http_req_duration                                                                                                                                        
k6-1  |     ✓ 'p(95)<500' p(95)=0s                                                                                                                                   
k6-1  | 
k6-1  |     http_req_failed                                                                                                                                          
k6-1  |     ✓ 'rate<0.1' rate=0.00%
k6-1  |                                                                                                                                                              
k6-1  |     ws_connecting                                                                                                                                            
k6-1  |     ✓ 'p(95)<1000' p(95)=41.59ms
k6-1  |                                                                                                                                                              
k6-1  |                                                                                                                                                              
k6-1  |   █ TOTAL RESULTS 
k6-1  |                                                                                                                                                              
k6-1  |     checks_total.......: 20930   54.169379/s                                                                                                                 
k6-1  |     checks_succeeded...: 100.00% 20930 out of 20930
k6-1  |     checks_failed......: 0.00%   0 out of 20930                                                                                                              
k6-1  |                                                                                                                                                              
k6-1  |     ✓ status is 101
k6-1  |     ✓ connection established                                                                                                                                 
k6-1  | 
k6-1  |     HTTP                                                                                                                                                     
k6-1  |     http_req_duration.....: avg=0s      min=0s     med=0s      max=0s       p(90)=0s      p(95)=0s     
k6-1  |     http_req_failed.......: 0.00%  0 out of 0                                                                                                                
k6-1  | 
k6-1  |     EXECUTION                                                                                                                                                
k6-1  |     iteration_duration....: avg=10.05s  min=10.03s med=10.05s  max=11s      p(90)=10.06s  p(95)=10.07s 
k6-1  |     iterations............: 10465  27.084689/s                                                                                                               
k6-1  |     vus...................: 1      min=1         max=500                                                                                                     
k6-1  |     vus_max...............: 500    min=500       max=500                                                                                                     
k6-1  | 
k6-1  |     NETWORK
k6-1  |     data_received.........: 4.2 MB 11 kB/s
k6-1  |     data_sent.............: 92 MB  238 kB/s
k6-1  |
k6-1  |     WEBSOCKET
k6-1  |     ws_connecting.........: avg=19.68ms min=6.09ms med=14.94ms max=974.95ms p(90)=31.21ms p(95)=41.59ms
k6-1  |     ws_msgs_sent..........: 533715 1381.319162/s
k6-1  |     ws_session_duration...: avg=10.05s  min=10.03s med=10.05s  max=11s      p(90)=10.06s  p(95)=10.07s
k6-1  |     ws_sessions...........: 10465  27.084689/s
k6-1  |
k6-1  |
k6-1  |
k6-1  |
k6-1  | running (6m26.4s), 000/500 VUs, 10465 complete and 0 interrupted iterations
```