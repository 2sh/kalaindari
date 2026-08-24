<?php

/*
if (!isset($_GET['keys']))
{
  header("Content-Type: text/plain");
  echo 'No keys provided.';
  exit(400);
}

$keys_raw = $_GET["keys"];
$keys = explode(",", $keys_raw);
*/

$db = new SQLite3('calendar.sqlite3');

// Calendars

$sql_calendars = <<<SQL
select
  calendar_key as `key`,
  calendar_name as `name`,
  calendar_bg as bg,
  calendar_fg as fg
from
  calendar
order by
  calendar_name
SQL;

$stmt = $db->prepare($sql_calendars);
$results = $stmt->execute();

$calendars = array();
while ($row = $results->fetchArray(SQLITE3_ASSOC))
{
  $calendars[] = $row;
}


// Events

// $phs = str_repeat('?,', count($keys) - 1) . '?';
$sql_events = <<<SQL
select
  calendar_key,
  event_title as title,
  event_description as `description`,

  event_start_method as start_method,
  event_start_args as start_args,

  event_end_method as end_method,
  event_end_args as end_args
from
  event
left join
  calendar using(calendar_id)
SQL;

// where
//   calendar_key in ($phs)

$stmt = $db->prepare($sql_events);
foreach($keys as $i => $key)
{
  $stmt->bindValue($i+1, $key, SQLITE3_TEXT);
}
$results = $stmt->execute();

$events = array();
while ($row = $results->fetchArray(SQLITE3_ASSOC))
{
  $events[] = $row;
}


// Output

header('Content-Type: application/json; charset=utf-8');

echo json_encode(array(
  'calendars' => $calendars,
  'events' => $events,
));