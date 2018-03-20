FROM httpd:2.4.29
COPY ./qount-half-ui-httpd.conf /usr/local/apache2/conf/httpd.conf
COPY ./dist/ /usr/local/apache2/htdocs/
COPY ./certs/ /usr/local/apache2/conf/
EXPOSE 80 443
