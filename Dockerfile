FROM httpd:2.4
COPY ./qount-half-ui-httpd.conf /usr/local/apache2/conf/httpd.conf
COPY ./build/prod/ /usr/local/apache2/htdocs/
COPY ./app/ /usr/local/apache2/htdocs/
COPY ./certs/ /usr/local/apache2/conf/
EXPOSE 80 443